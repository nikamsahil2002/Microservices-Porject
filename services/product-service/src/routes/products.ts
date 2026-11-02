import {Router} from 'express';
import {
  createProductController,
  deleteProductController,
  getProductController,
  getProductsController,
  updateProductController,
} from '../controllers/productController';
import {errorWrapper} from '../middleware/errorWrapper';
import {
  createProductValidator,
  getProductsValidator,
  productIdValidator,
  updateProductValidator,
  validationHandler,
} from '../validator/validationHandler';

const router = Router();

router.post('/', createProductValidator, validationHandler, errorWrapper(createProductController));
router.get('/', getProductsValidator, validationHandler, errorWrapper(getProductsController));
router.get('/:id', productIdValidator, validationHandler, errorWrapper(getProductController));
router.put(
  '/:id',
  updateProductValidator,
  validationHandler,
  errorWrapper(updateProductController),
);
router.delete('/:id', productIdValidator, validationHandler, errorWrapper(deleteProductController));

export default router;
