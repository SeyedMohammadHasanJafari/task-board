import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Activity } from '../models/Activity.js';
import { Card } from '../models/Card.js';
import { getIO } from '../socket/index.js';

const createActivitySchema = z.object({
  content: z.string().min(1, 'Content cannot be empty').max(1000, 'Content max 1000 chars'),
  type: z.enum(['comment', 'system_log']).default('comment'),
  userName: z.string().min(1).default('Anonymous Collaborator'),
  userAvatarColor: z.string().default('#06b6d4'),
});

export async function getCardActivities(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { cardId } = req.params;
    const activities = await Activity.find({ cardId }).sort({ createdAt: 1 }).limit(100);

    res.status(200).json({
      success: true,
      activities: activities.map((a) => a.toJSON()),
    });
  } catch (error) {
    next(error);
  }
}

export async function createCardActivity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { cardId } = req.params;
    const parseResult = createActivitySchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.format(),
      });
      return;
    }

    const { content, type, userName, userAvatarColor } = parseResult.data;

    // Check if card exists to obtain boardId
    const card = await Card.findById(cardId);
    if (!card) {
      res.status(404).json({ success: false, message: 'Card not found' });
      return;
    }

    const activity = await Activity.create({
      cardId,
      userId: (req as any).user?.userId || null,
      userName: (req as any).user?.name || userName,
      userAvatarColor: (req as any).user?.avatarColor || userAvatarColor,
      type,
      content,
    });

    const activityJson = activity.toJSON();

    // Broadcast in real-time to the board room
    const io = getIO();
    if (io) {
      io.to(card.boardId.toString()).emit('activity-created', {
        boardId: card.boardId.toString(),
        cardId,
        activity: activityJson,
      });
    }

    res.status(201).json({
      success: true,
      activity: activityJson,
    });
  } catch (error) {
    next(error);
  }
}
