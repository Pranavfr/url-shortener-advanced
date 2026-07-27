import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getApiKeys, createApiKey, deleteApiKey } from '../controllers/apiKeyController';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getApiKeys);
router.post('/', createApiKey);
router.delete('/:id', deleteApiKey);

export default router;
