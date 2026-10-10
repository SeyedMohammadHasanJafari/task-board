import { Router } from 'express';
import {
  getBoards,
  getBoardById,
  getOrCreateDemoBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  createColumn,
  updateColumn,
  deleteColumn,
} from '../controllers/boardController.js';
import {
  getCardsByBoard,
  createCard,
} from '../controllers/cardController.js';
import { requireAuth, optionalAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Demo board endpoint (must be before /:id)
router.get('/demo', optionalAuth, getOrCreateDemoBoard);

// Board routes
router.get('/', optionalAuth, getBoards);
router.post('/', requireAuth, createBoard);
router.get('/:id', optionalAuth, getBoardById);
router.put('/:id', requireAuth, updateBoard);
router.delete('/:id', requireAuth, deleteBoard);

// Column routes
router.post('/:id/columns', optionalAuth, createColumn);
router.put('/:id/columns/:columnId', optionalAuth, updateColumn);
router.delete('/:id/columns/:columnId', optionalAuth, deleteColumn);

// Card routes nested under board
router.get('/:id/cards', optionalAuth, getCardsByBoard);
router.post('/:id/cards', optionalAuth, createCard);

export default router;
