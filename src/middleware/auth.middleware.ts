// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { UserRole } from '../utils/types';
import { PrismaClient } from '@prisma/client';

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
        role: UserRole; 
        [key: string]: any;
      };
    }
  }
}

const prisma = new PrismaClient();

export async function authenticate(req: Request, res: Response, next: NextFunction) : Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
     res.status(401).json({ message: 'Aucun token fourni.' });
  }

  // Le header est au format "Bearer <token>"
  const [, token] = authHeader.split(' ');

  if (!token) {
     res.status(401).json({ message: 'Format de token invalide.' });
  }

  try {
    const decoded = verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload;
    
    // Récupérer l'utilisateur complet pour avoir accès au rôle
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    if (!user) {
       res.status(401).json({ message: 'Utilisateur non trouvé.' });
    }
    
    req.user = user; // Attacher l'objet utilisateur complet
    return next();
  } catch (err) {
     res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
}


export function checkRole(roles: UserRole[])  {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès interdit. Rôle insuffisant.' });
    }
    next();
  };
}