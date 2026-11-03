import {Router} from 'express';
import {
  createOrderController,
  deleteOrderController,
  getOrderController,
  getOrdersController,
  updateOrderController,
} from '../controllers/orderController';
import {errorWrapper} from '../middleware/errorWrapper';
import {
  createOrderValidator,
  getOrdersValidator,
  orderIdValidator,
  updateOrderValidator,
  validationHandler,
} from '../validator/validationHandler';

const router = Router();

router.post('/', createOrderValidator, validationHandler, errorWrapper(createOrderController));
router.get('/', getOrdersValidator, validationHandler, errorWrapper(getOrdersController));
router.get('/:id', orderIdValidator, validationHandler, errorWrapper(getOrderController));
router.put('/:id', updateOrderValidator, validationHandler, errorWrapper(updateOrderController));
router.delete('/:id', orderIdValidator, validationHandler, errorWrapper(deleteOrderController));

export default router;
