const httpStatus = require('http-status');

export class CustomError extends Error {
  readonly statusCode: number;
  readonly isOperational = true;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = new.target.name;
    Error.captureStackTrace?.(this, new.target);
  }
}

export class ValidationError extends CustomError {
  constructor(message = 'Validation Error') {
    super(message, httpStatus.status.BAD_REQUEST);
  }
}

export class NoDataFoundError extends CustomError {
  constructor(message = 'No Data Found') {
    super(message, httpStatus.status.OK);
  }
}

export class DataFoundError extends CustomError {
  constructor(message = 'Data Found') {
    super(message, httpStatus.status.CONFLICT);
  }
}

export class BadRequestError extends CustomError {
  constructor(message = 'Bad Request') {
    super(message, httpStatus.status.BAD_REQUEST);
  }
}

export class InternalServerError extends CustomError {
  constructor(message = 'Internal Server Error') {
    super(message, httpStatus.status.INTERNAL_SERVER_ERROR);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message = 'Unauthorized') {
    super(message, httpStatus.status.UNAUTHORIZED);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message = 'Forbidden') {
    super(message, httpStatus.status.FORBIDDEN);
  }
}

export class UnprocessableEntityError extends CustomError {
  constructor(message = 'Unprocessable Entity') {
    super(message, httpStatus.status.UNPROCESSABLE_ENTITY);
  }
}
