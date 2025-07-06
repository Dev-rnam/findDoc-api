import { Prisma, PrismaClient} from '@prisma/client';
import { hash, compare } from 'bcryptjs';
import { Resend } from 'resend';
import crypto from 'crypto';
import { sign } from 'jsonwebtoken';


const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

interface SignupData {
  email: string;
  password: string;
  lastName: string;
  firstName?: string;
  gender?: string;
}

interface VerifyOtpData {
    email: string;
    otpCode: string;
  }

  interface LoginData {
    email: string;
    password: string;
  }

export async function signup(data: SignupData) {
  const { email, password, lastName, firstName, gender } = data;

  // 1. Vérifier si l'utilisateur existe déjà
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Un utilisateur avec cet email existe déjà.');
  }

  // 2. Hacher le mot de passe
  const passwordHash = await hash(password, 10);

  // 3. Générer un OTP (6 chiffres)
  const otpCode = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

  // Si une opération échoue, tout est annulé.
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      lastName,
      firstName,
      gender,
      isActive: false, 
    },
  });

  await prisma.otp.create({
    data: {
      code: otpCode,
      expiresAt,
      userId: user.id,
    },
  });

  // 5. Envoyer l'email de vérification via Resend
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Doit être un domaine vérifié sur Resend
      to: email,
      subject: 'Votre code de vérification',
      html: `<p>Bonjour,</p><p>Votre code de vérification est : <strong>${otpCode}</strong></p><p>Il expire dans 5 minutes.</p>`,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    // On pourrait vouloir annuler la création de l'utilisateur ici ou mettre en place une nouvelle tentative
    throw new Error("Le compte a été créé, mais l'envoi de l'email de vérification a échoué.");
  }

  return {
    message: 'Utilisateur créé. Veuillez vérifier votre email pour activer votre compte.',
    userId: user.id,
  };
}

export async function verifyOtp(data: VerifyOtpData) {
    const { email, otpCode } = data;
  
    // 1. Trouver l'utilisateur et son OTP associé
    const user = await prisma.user.findUnique({
      where: { email },
      include: { otp: true }, // Inclure l'OTP dans la requête
    });
  
    // 2. Vérifications de sécurité
    if (!user || !user.otp || user.otp.length === 0) {
      throw new Error("Utilisateur non trouvé ou aucune vérification en attente.");
    }
    if (user.otp[0].code !== otpCode) {
      throw new Error("Code OTP invalide.");
    }
    if (user.otp[0].expiresAt < new Date()) {
      throw new Error("Le code OTP a expiré.");
    }
  
    // 3. Mettre à jour l'utilisateur et supprimer l'OTP (transaction)
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Activer le compte utilisateur
      await tx.user.update({
        where: { id: user.id },
        data: { isActive: true },
      });
      // Supprimer l'OTP pour qu'il ne soit pas réutilisé
      await tx.otp.delete({
        where: { id: user.otp[0].id },
      });
    });
  
    // 4. Générer les tokens JWT
    const accessToken = sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: '15m', // Durée de vie courte comme dans le plan
    });
  
    const refreshToken = sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: '7d', // Durée de vie plus longue
    });
  
    return { accessToken, refreshToken };
  }

  export async function login(data: LoginData) {
    const { email, password } = data;
  
    // 1. Trouver l'utilisateur
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("Email ou mot de passe incorrect.");
    }
  
    // 2. Vérifier si le compte est actif
    if (!user.isActive) {
      throw new Error("Votre compte n'est pas encore activé. Veuillez vérifier votre email.");
    }
  
    // 3. Comparer les mots de passe
    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Email ou mot de passe incorrect.");
    }
  
    // 4. Générer de nouveaux tokens
    const accessToken = sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: '15m',
    });
  
    const refreshToken = sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: '7d',
    });
  
    return { accessToken, refreshToken };

}