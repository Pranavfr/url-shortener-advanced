import { Router } from 'express';
import { createUrl, getUrls, updateUrl, deleteUrl, generateQR } from '../controllers/urlController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authMiddleware, createUrl);
router.get('/', authMiddleware, getUrls);
router.put('/:id', authMiddleware, updateUrl);
router.delete('/:id', authMiddleware, deleteUrl);
router.get('/qr/:id', authMiddleware, generateQR);

export default router;
