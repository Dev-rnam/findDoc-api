import { Request, Response } from 'express';
import * as userService from '../../services/user.service';
import { z } from 'zod';
import { updateUserSchema } from './user.validation';


export async function getMeHandler(req: Request, res: Response): Promise<void> {
  try {
    // req.user est défini par notre middleware d'authentification
    const userId = req.user?.id;

    if (!userId) {
       res.status(401).json({ message: 'Non autorisé.' });
       return;
    }

    const userProfile = await userService.getUserProfile(userId);

     res.status(200).json(userProfile);
  } catch (error: any) {
    // Si l'utilisateur est supprimé après la validation du token, par exemple
     res.status(404).json({ message: error.message });
  }
}

export async function updateMeHandler(req: Request, res: Response): Promise<void> {
  try {
    const { body } = updateUserSchema.parse(req);
    const userId = req.user!.id;

    const updatedUser = await userService.updateUserProfile(userId, body);

     res.status(200).json(updatedUser);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ errors: error.errors });
    }
     res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}