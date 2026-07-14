export class AppError extends Error {
  constructor(code) {
    super(code);
    this.name = 'AppError';
    this.code = code;
  }
}

export const getErrorMessageKey = (error, fallbackKey) =>
  error instanceof AppError ? error.code : fallbackKey;
