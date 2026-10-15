import { Router } from 'express';
import {
  getCurrentUserController,
  loginUserController,
  registerUserController,
} from '../controllers/userController';
import { requireAuth } from '../middleware/auth';
import { errorWrapper } from '../middleware/errorWrapper';

const router = Router();

router.post('/register', errorWrapper(registerUserController));
router.post('/login', errorWrapper(loginUserController));
router.get('/me', requireAuth, errorWrapper(getCurrentUserController));

export default router;
