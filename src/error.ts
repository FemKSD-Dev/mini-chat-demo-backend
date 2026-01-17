export type ErrorCode = 'BAD_REQUEST' | 'NOT_FOUND' | 'FORBIDDEN' | 'INTERNAL_ERROR';

export class ApiError extends Error {
  status: number;
  code: ErrorCode;
  details?: unknown;

  constructor(status: number, code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown) => {
  return new ApiError(400, 'BAD_REQUEST', message, details);
};

export const notFound = (message: string, details?: unknown) => {
  return new ApiError(404, 'NOT_FOUND', message, details);
};

export const forbidden = (message: string, details?: unknown) => {
  return new ApiError(403, 'FORBIDDEN', message, details);
};

export const internalError = (message: string, details?: unknown) => {
  return new ApiError(500, 'INTERNAL_ERROR', message, details);
};