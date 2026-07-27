import { Router } from 'express';
import { createUrl, bulkCreateUrl, getUrls, updateUrl, deleteUrl, generateQR, unlockUrl } from '../controllers/urlController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authMiddleware, createUrl);
router.post('/bulk', authMiddleware, bulkCreateUrl);
router.get('/', authMiddleware, getUrls);
router.put('/:id', authMiddleware, updateUrl);
router.delete('/:id', authMiddleware, deleteUrl);
router.get('/qr/:id', authMiddleware, generateQR);
router.post('/unlock/:shortCode', unlockUrl); // Public endpoint

export default router;
