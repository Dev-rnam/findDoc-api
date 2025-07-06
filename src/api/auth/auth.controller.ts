// src/api/auth/auth.controller.ts
import { Request, Response } from 'express';
import * as authService from '../../services/auth.service';
import { signupSchema, verifyOtpSchema, loginSchema } from './auth.validation';
import { z } from 'zod';

export async function signupHandler(req: Request, res: Response): Promise<void> {
  try {
    // Valider le corps de la requête avec Zod
    const { body } = signupSchema.parse(req);

    const result = await authService.signup(body);

     res.status(201).json(result);
  } catch (error: any) {
    // Gérer les erreurs de validation de Zod
    if (error instanceof z.ZodError) {
       res.status(400).json({ errors: error.errors });
    }
    // Gérer les autres erreurs (ex: email déjà utilisé)
     res.status(409).json({ message: error.message });
  }
}

export async function verifyOtpHandler(req: Request, res: Response): Promise<void> {
    try {
      const { body } = verifyOtpSchema.parse(req);
  
      const { accessToken, refreshToken } = await authService.verifyOtp(body);
  
      // Stocker le refresh token dans un cookie sécurisé
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // Le cookie n'est pas accessible via JavaScript côté client
        secure: process.env.NODE_ENV === 'production', // Uniquement sur HTTPS en production
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });
  
      // Envoyer l'access token dans le corps de la réponse
       res.status(200).json({ accessToken });
  
    } catch (error: any) {
      if (error instanceof z.ZodError) {
         res.status(400).json({ errors: error.errors });
      }
       res.status(400).json({ message: error.message });
    }
  }

  export async function loginHandler(req: Request, res: Response): Promise<void> {
    try {
      const { body } = loginSchema.parse(req);
  
      const { accessToken, refreshToken } = await authService.login(body);
  
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });
  
       res.status(200).json({ accessToken });
  
    } catch (error: any) {
      if (error instanceof z.ZodError) {
         res.status(400).json({ errors: error.errors });
      }
      // Pour le login, l'erreur est souvent une non-autorisation
       res.status(401).json({ message: error.message });
    }
  }