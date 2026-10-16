import {Router} from 'express';
import {
  getCurrentUserController,
  loginUserController,
  logoutController,
  refreshTokenController,
  registerUserController,
} from '../controllers/userController';
import {checkAuth} from '../middleware/checkAuth';
import {errorWrapper} from '../middleware/errorWrapper';
import {registerUserValidator, validationHandler} from '../validator/validationHandler';

const router = Router();

router.post(
  '/register',
  registerUserValidator,
  validationHandler,
  errorWrapper(registerUserController),
);
router.post('/login', errorWrapper(loginUserController));
router.post('/refresh', errorWrapper(refreshTokenController));
router.post('/logout', checkAuth, errorWrapper(logoutController));
router.get('/me', checkAuth, errorWrapper(getCurrentUserController));

export default router;
