import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getBioPage, updateBioPage, getPublicBioPage } from '../controllers/bioController';

const router = express.Router();

router.get('/public/:username', getPublicBioPage);

router.use(protect);
router.get('/', getBioPage);
router.post('/', updateBioPage);

export default router;
