import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/:id', authMiddleware, getAnalytics);

export default router;
