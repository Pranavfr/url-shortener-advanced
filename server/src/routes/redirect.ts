import { Router } from 'express';
import { redirectUrl } from '../controllers/redirectController';

const router = Router();

router.get('/:shortCode', redirectUrl);

export default router;
