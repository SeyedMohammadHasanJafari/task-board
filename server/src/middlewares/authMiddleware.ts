import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type TokenPayload } from '../utils/token.js';
import { User, type IUserDocument } from '../models/User.js';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
      tokenPayload?: TokenPayload;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication token missing or invalid',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    let payload: TokenPayload;

    try {
      payload = verifyToken(token);
    } catch {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token',
      });
      return;
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User account associated with this token no longer exists',
      });
      return;
    }

    req.user = user;
    req.tokenPayload = payload;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = verifyToken(token);
      const user = await User.findById(payload.userId);
      if (user) {
        req.user = user;
        req.tokenPayload = payload;
      }
    } catch {
      // Ignore token verification errors for optional auth
    }

    next();
  } catch (error) {
    next(error);
  }
}
