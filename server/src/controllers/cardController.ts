import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Card } from '../models/Card.js';
import {
  createCardSchema,
  updateCardSchema,
  moveCardSchema,
} from '../validators/boardValidators.js';

export async function getCardsByBoard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const cards = await Card.find({ boardId: id }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      cards: cards.map((c) => c.toJSON()),
    });
  } catch (error) {
    next(error);
  }
}

export async function createCard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: boardId } = req.params;
    const parseResult = createCardSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.format(),
      });
      return;
    }

    const { columnId, title, description, priority, tags, order } = parseResult.data;

    // Calculate next order if not specified
    let cardOrder = order;
    if (cardOrder === undefined) {
      const maxOrderCard = await Card.findOne({ boardId, columnId })
        .sort({ order: -1 })
        .select('order');
      cardOrder = maxOrderCard ? maxOrderCard.order + 1 : 0;
    }

    const card = await Card.create({
      boardId,
      columnId,
      title,
      description: description || '',
      priority: priority || 'medium',
      tags: tags || [],
      order: cardOrder,
    });

    res.status(201).json({
      success: true,
      card: card.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = updateCardSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.format(),
      });
      return;
    }

    const card = await Card.findByIdAndUpdate(
      id,
      { $set: parseResult.data },
      { new: true }
    );

    if (!card) {
      res.status(404).json({ success: false, message: 'Card not found' });
      return;
    }

    res.status(200).json({
      success: true,
      card: card.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function moveCard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = moveCardSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.format(),
      });
      return;
    }

    const { columnId, order, siblingIds } = parseResult.data;

    const card = await Card.findById(id);
    if (!card) {
      res.status(404).json({ success: false, message: 'Card not found' });
      return;
    }

    card.columnId = columnId as any;
    card.order = order;
    await card.save();

    // If array of sibling card IDs is passed, batch update their order
    if (siblingIds && siblingIds.length > 0) {
      const targetColId = new Types.ObjectId(columnId);
      const bulkOps = siblingIds.map((siblingId, index) => ({
        updateOne: {
          filter: { _id: new Types.ObjectId(siblingId) },
          update: { $set: { columnId: targetColId, order: index } },
        },
      }));

      await Card.bulkWrite(bulkOps as any);
    }

    res.status(200).json({
      success: true,
      message: 'Card position updated successfully',
      card: card.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const card = await Card.findByIdAndDelete(id);

    if (!card) {
      res.status(404).json({ success: false, message: 'Card not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Card deleted successfully',
      id,
    });
  } catch (error) {
    next(error);
  }
}
