import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getFolders, createFolder, deleteFolder, getTags, createTag, deleteTag } from '../controllers/metadataController';

const router = express.Router();

router.use(protect);

router.get('/folders', getFolders);
router.post('/folders', createFolder);
router.delete('/folders/:id', deleteFolder);

router.get('/tags', getTags);
router.post('/tags', createTag);
router.delete('/tags/:id', deleteTag);

export default router;
