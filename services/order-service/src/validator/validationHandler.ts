import {NextFunction, Request, Response} from 'express';
import {body, validationResult} from 'express-validator';

export const createOrderValidator = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isString()
    .withMessage('User ID must be a string')
    .isLength({max: 100})
    .withMessage('User ID must not exceed 100 characters'),
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isString()
    .withMessage('Product ID must be a string')
    .isLength({max: 100})
    .withMessage('Product ID must not exceed 100 characters'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({min: 1})
    .withMessage('Quantity must be a positive integer')
    .toInt(),
  body('totalAmount')
    .notEmpty()
    .withMessage('Total amount is required')
    .isFloat({min: 0})
    .withMessage('Total amount must be a number greater than or equal to 0')
    .toFloat(),
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
