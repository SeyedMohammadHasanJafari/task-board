import type { Request, Response, NextFunction } from 'express';
import mongoose, { Types } from 'mongoose';
import { Board, type IBoardColumn } from '../models/Board.js';
import { Card } from '../models/Card.js';
import { Activity } from '../models/Activity.js';
import { User } from '../models/User.js';
import {
  createBoardSchema,
  updateBoardSchema,
  createColumnSchema,
  updateColumnSchema,
} from '../validators/boardValidators.js';

export async function getOrCreateDemoBoard(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let board = await Board.findOne({ title: 'Product Sprint 2026 (Demo Board)' });

    if (!board) {
      // Find or create a demo admin user to own the board
      let demoOwner = await User.findOne({ email: 'demo@taskflow.dev' });
      if (!demoOwner) {
        demoOwner = await User.create({
          name: 'TaskFlow Team',
          email: 'demo@taskflow.dev',
          avatarColor: '#06b6d4',
          isGuest: false,
        });
      }

      board = await Board.create({
        title: 'Product Sprint 2026 (Demo Board)',
        ownerId: demoOwner._id,
        columns: [
          { title: 'Backlog', order: 0 },
          { title: 'In Progress', order: 1 },
          { title: 'Review', order: 2 },
          { title: 'Done', order: 3 },
        ],
      });

      // Populate initial sample cards to provide an immediate interactive experience
      const colMap = new Map(board.columns.map((c: any) => [c.title, c._id]));

      const sampleCards = [
        {
          boardId: board._id,
          columnId: colMap.get('Backlog'),
          title: 'Implement Dark Neon Design System',
          description: 'Refactor Tailwind tokens and glassmorphism styling for futuristic look.',
          order: 0,
          priority: 'high',
          tags: ['UI/UX', 'Design'],
        },
        {
          boardId: board._id,
          columnId: colMap.get('Backlog'),
          title: 'Setup Redis adapter for WebSocket clusters',
          description: 'Enable multi-server horizontal scaling with Socket.io redis-adapter.',
          order: 1,
          priority: 'medium',
          tags: ['Infra', 'Socket'],
        },
        {
          boardId: board._id,
          columnId: colMap.get('In Progress'),
          title: 'Real-Time Drag and Drop Synchronization',
          description: 'Cards snap into place with optimistic UI updates and socket broadcast.',
          order: 0,
          priority: 'urgent',
          tags: ['Frontend', 'Kanban'],
        },
        {
          boardId: board._id,
          columnId: colMap.get('In Progress'),
          title: 'Live Cursors & Presence indicators',
          description: 'Broadcast pointer coordinates throttled at 50ms with custom glowing cursors.',
          order: 1,
          priority: 'high',
          tags: ['WebSockets', 'Collaboration'],
        },
        {
          boardId: board._id,
          columnId: colMap.get('Review'),
          title: 'Yjs CRDT Concurrent Rich Text Editor',
          description: 'Conflict-free collaborative card descriptions using TipTap + Yjs.',
          order: 0,
          priority: 'urgent',
          tags: ['CRDT', 'Editor'],
        },
        {
          boardId: board._id,
          columnId: colMap.get('Done'),
          title: 'Core Architecture & Environment Baseline',
          description: 'Express server, MongoDB connection layer, Vite React frontend, and client-server health checks.',
          order: 0,
          priority: 'low',
          tags: ['Core', 'Setup'],
        },
        {
          boardId: board._id,
          columnId: colMap.get('Done'),
          title: 'Authentication & Guest Session Provisioning',
          description: 'JWT token signing, 1-click ephemeral guest generation, and route guards.',
          order: 1,
          priority: 'medium',
          tags: ['Auth', 'Security'],
        },
      ];

      await Card.insertMany(sampleCards);
    }

    const cards = await Card.find({ boardId: board._id }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      board: board.toJSON(),
      cards: cards.map((c) => c.toJSON()),
    });
  } catch (error) {
    next(error);
  }
}

export async function getBoards(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(200).json({ success: true, boards: [] });
      return;
    }

    // Return boards owned by user or where user is an invited member
    const boards = await Board.find({
      $or: [
        { ownerId: userId },
        { 'members.userId': userId },
      ],
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      boards: boards.map((b) => b.toJSON()),
    });
  } catch (error) {
    next(error);
  }
}

export async function getBoardById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      // If client requests "demo", route to demo board
      if (id === 'demo' || id === 'demo-board') {
        return getOrCreateDemoBoard(req, res, next);
      }
      res.status(400).json({ success: false, message: 'Invalid Board ID format' });
      return;
    }

    const board = await Board.findById(id);
    if (!board) {
      res.status(404).json({ success: false, message: 'Board not found' });
      return;
    }

    const cards = await Card.find({ boardId: board._id }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      board: board.toJSON(),
      cards: cards.map((c) => c.toJSON()),
    });
  } catch (error) {
    next(error);
  }
}

export async function createBoard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parseResult = createBoardSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.format(),
      });
      return;
    }

    const { title, columns } = parseResult.data;
    const userId = req.user!._id;

    const initialColumns = columns && columns.length > 0
      ? columns.map((c, i) => ({ title: c.title, order: c.order ?? i }))
      : [
          { title: 'Backlog', order: 0 },
          { title: 'In Progress', order: 1 },
          { title: 'Review', order: 2 },
          { title: 'Done', order: 3 },
        ];

    const board = await Board.create({
      title,
      ownerId: userId,
      columns: initialColumns,
    });

    res.status(201).json({
      success: true,
      message: 'Board created successfully',
      board: board.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBoard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = updateBoardSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.format(),
      });
      return;
    }

    const board = await Board.findByIdAndUpdate(
      id,
      { $set: parseResult.data },
      { new: true }
    );

    if (!board) {
      res.status(404).json({ success: false, message: 'Board not found' });
      return;
    }

    res.status(200).json({
      success: true,
      board: board.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteBoard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const board = await Board.findByIdAndDelete(id);

    if (!board) {
      res.status(404).json({ success: false, message: 'Board not found' });
      return;
    }

    // Cascade delete cards and their activities
    const cards = await Card.find({ boardId: board._id }).select('_id');
    const cardIds = cards.map((c) => c._id);
    await Card.deleteMany({ boardId: board._id });
    if (cardIds.length > 0) {
      await Activity.deleteMany({ cardId: { $in: cardIds } });
    }

    res.status(200).json({
      success: true,
      message: 'Board and all associated cards deleted',
      id,
    });
  } catch (error) {
    next(error);
  }
}

export async function createColumn(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = createColumnSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.format(),
      });
      return;
    }

    const board = await Board.findById(id);
    if (!board) {
      res.status(404).json({ success: false, message: 'Board not found' });
      return;
    }

    const order = parseResult.data.order ?? board.columns.length;
    const newCol = {
      _id: new Types.ObjectId(),
      title: parseResult.data.title,
      order,
    };

    board.columns.push(newCol as any);
    await board.save();

    res.status(201).json({
      success: true,
      column: {
        id: newCol._id.toString(),
        title: newCol.title,
        order: newCol.order,
      },
      board: board.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateColumn(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id, columnId } = req.params;
    const parseResult = updateColumnSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.format(),
      });
      return;
    }

    const board = await Board.findById(id);
    if (!board) {
      res.status(404).json({ success: false, message: 'Board not found' });
      return;
    }

    const col = board.columns.find((c: any) => c._id.toString() === columnId);
    if (!col) {
      res.status(404).json({ success: false, message: 'Column not found' });
      return;
    }

    if (parseResult.data.title !== undefined) col.title = parseResult.data.title;
    if (parseResult.data.order !== undefined) col.order = parseResult.data.order;

    await board.save();

    res.status(200).json({
      success: true,
      column: {
        id: col._id.toString(),
        title: col.title,
        order: col.order,
      },
      board: board.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteColumn(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id, columnId } = req.params;
    const board = await Board.findById(id);
    if (!board) {
      res.status(404).json({ success: false, message: 'Board not found' });
      return;
    }

    board.columns = board.columns.filter((c: any) => c._id.toString() !== columnId);
    await board.save();

    // Delete cards that belonged to this column
    await Card.deleteMany({ boardId: board._id, columnId });

    res.status(200).json({
      success: true,
      message: 'Column and cards removed successfully',
      board: board.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}
