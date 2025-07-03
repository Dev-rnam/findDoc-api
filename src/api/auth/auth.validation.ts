import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    email: z.string().email('Adresse email invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    lastName: z.string().min(2, 'Le nom de famille est requis'),
    firstName: z.string().min(2, 'Le prénom est requis').optional(),
    gender: z.string().optional(),
  }),
});

export const verifyOtpSchema = z.object({
    body: z.object({
      email: z.string().email('Adresse email invalide'),
      otpCode: z.string().length(6, 'Le code OTP doit contenir 6 chiffres'),
    }),
  });

  export const loginSchema = z.object({
    body: z.object({
      email: z.string().email('Adresse email invalide'),
      password: z.string().min(1, 'Le mot de passe est requis'),
    }),
  });