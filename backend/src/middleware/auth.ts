import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cok-gizli-super-guvenli-bir-sir';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    req.userId = user.userId;
    next();
  });
};
