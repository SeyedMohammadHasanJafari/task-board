import { z } from 'zod';

export const createBoardSchema = z.object({
  title: z
    .string({ required_error: 'Board title is required' })
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  columns: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(50),
        order: z.number().int().nonnegative().optional(),
      })
    )
    .optional(),
});

export const updateBoardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .optional(),
});

export const createColumnSchema = z.object({
  title: z
    .string({ required_error: 'Column title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(50, 'Title cannot exceed 50 characters'),
  order: z.number().int().nonnegative().optional(),
});

export const updateColumnSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(50, 'Title cannot exceed 50 characters')
    .optional(),
  order: z.number().int().nonnegative().optional(),
});

export const createCardSchema = z.object({
  columnId: z.string({ required_error: 'columnId is required' }),
  title: z
    .string({ required_error: 'Card title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z.any().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  tags: z.array(z.string()).optional(),
  order: z.number().int().nonnegative().optional(),
});

export const updateCardSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.any().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  tags: z.array(z.string()).optional(),
  columnId: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
});

export const moveCardSchema = z.object({
  columnId: z.string({ required_error: 'Destination columnId is required' }),
  order: z.number().int().nonnegative({ message: 'Order must be non-negative' }),
  siblingIds: z.array(z.string()).optional(),
});
