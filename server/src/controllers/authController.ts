import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signToken } from '../utils/token.js';
import { generateGuestProfile } from '../utils/guestGenerator.js';
import {
  registerSchema,
  loginSchema,
  guestSchema,
} from '../validators/authValidators.js';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.format(),
      });
      return;
    }

    const { name, email, password, avatarColor } = parseResult.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      avatarColor: avatarColor || '#06b6d4',
      isGuest: false,
    });

    const token = signToken({
      userId: user._id.toString(),
      isGuest: false,
      email: user.email,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: user.toSafeUser(),
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.format(),
      });
      return;
    }

    const { email, password } = parseResult.data;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !user.passwordHash || user.isGuest) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const token = signToken({
      userId: user._id.toString(),
      isGuest: false,
      email: user.email,
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: user.toSafeUser(),
    });
  } catch (error) {
    next(error);
  }
}

export async function createGuest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parseResult = guestSchema.safeParse(req.body || {});
    const input = parseResult.success ? parseResult.data : {};

    const profile = generateGuestProfile(input.name, input.avatarColor);

    const guestUser = await User.create({
      name: profile.name,
      avatarColor: profile.avatarColor,
      isGuest: true,
    });

    const token = signToken({
      userId: guestUser._id.toString(),
      isGuest: true,
    });

    res.status(201).json({
      success: true,
      message: 'Guest session created successfully',
      token,
      user: guestUser.toSafeUser(),
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: req.user.toSafeUser(),
    });
  } catch (error) {
    next(error);
  }
}
