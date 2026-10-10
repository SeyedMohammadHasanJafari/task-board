import { Router } from 'express';
import {
  updateCard,
  moveCard,
  deleteCard,
} from '../controllers/cardController.js';
import {
  getCardActivities,
  createCardActivity,
} from '../controllers/activityController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = Router();

router.put('/:id', optionalAuth, updateCard);
router.put('/:id/move', optionalAuth, moveCard);
router.delete('/:id', optionalAuth, deleteCard);

// Activity feed & comments
router.get('/:cardId/activities', optionalAuth, getCardActivities);
router.post('/:cardId/activities', optionalAuth, createCardActivity);

export default router;
