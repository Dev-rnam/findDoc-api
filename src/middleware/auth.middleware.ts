// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  iat: number;
  exp: number;
}

// Étendre le type Request d'Express pour y ajouter notre propriété `user`
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Aucun token fourni.' });
  }

  // Le header est au format "Bearer <token>"
  const [, token] = authHeader.split(' ');

  if (!token) {
    return res.status(401).json({ message: 'Format de token invalide.' });
  }

  try {
    const decoded = verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload;
    
    // Attacher l'id de l'utilisateur à la requête
    req.user = { id: decoded.userId };
    
    return next(); // Passe au prochain handler/middleware
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
}