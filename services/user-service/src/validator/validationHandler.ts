import {NextFunction, Request, Response} from 'express';
import {body, validationResult} from 'express-validator';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerUserValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({min: 1, max: 255})
    .withMessage('Name must be between 1 to 255 characters'),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .matches(passwordRegex)
    .withMessage(
      'Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a digit, and a special character',
    ),
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
