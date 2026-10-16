import {NextFunction, Request, Response} from 'express';
import {body, validationResult} from 'express-validator';

export const createProductValidator = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isString()
    .withMessage('Product name must be a string')
    .trim()
    .isLength({min: 1, max: 255})
    .withMessage('Product name must be between 1 and 255 characters'),
  body('description').optional().isString().withMessage('Product description must be a string'),
  body('sku')
    .notEmpty()
    .withMessage('SKU is required')
    .isString()
    .withMessage('SKU must be a string')
    .trim()
    .isLength({min: 1, max: 100})
    .withMessage('SKU must be between 1 and 100 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({min: 0})
    .withMessage('Price must be a number greater than or equal to 0')
    .toFloat(),
  body('stock')
    .optional()
    .isInt({min: 0})
    .withMessage('Stock must be a non-negative integer')
    .toInt(),
  body('active').optional().isBoolean().withMessage('Active must be a boolean').toBoolean(),
];

export function validationHandler(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      errors: errors.array({onlyFirstError: true}).map((error) => ({
        location: 'location' in error ? error.location : 'body',
        field: 'path' in error ? String(error.path) : 'body',
        message: error.msg,
      })),
    });
    return;
  }

  next();
}
