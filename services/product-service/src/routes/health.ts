import {Router} from 'express';
import {getHealth} from '../controllers/healthController';
import {errorWrapper} from '../middleware/errorWrapper';

const router = Router();

router.get('/', errorWrapper(getHealth));

export default router;
