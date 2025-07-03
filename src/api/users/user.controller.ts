// src/api/users/user.controller.ts
import { Request, Response } from 'express';
import * as userService from '../../services/user.service';

export async function getMeHandler(req: Request, res: Response) {
  try {
    // req.user est défini par notre middleware d'authentification
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Non autorisé.' });
    }

    const userProfile = await userService.getUserProfile(userId);

    return res.status(200).json(userProfile);
  } catch (error: any) {
    // Si l'utilisateur est supprimé après la validation du token, par exemple
    return res.status(404).json({ message: error.message });
  }
}