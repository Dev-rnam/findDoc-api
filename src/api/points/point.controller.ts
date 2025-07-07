
import { Request, Response } from 'express';
import * as pointsService from '../../services/point.service';

export async function convertPointsHandler(req: Request, res: Response): Promise<void> {
  const { points } = req.body;
  const userId = req.user!.id;
  if (!points || points <= 0) {
     res.status(400).json({ message: 'Nombre de points invalide.' });
  }
  try {
    const conversion = await pointsService.convertPoints(userId, points);
    res.status(200).json({ message: 'Conversion réussie.', conversion });
  } catch (error: any) {
     res.status(400).json({ message: error.message });
  }
}

export async function getHistoryHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const history = await pointsService.getHistory(userId);
  res.status(200).json(history);
}