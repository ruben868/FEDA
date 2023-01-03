
export class AppError extends Error {

  httpStatus?: number = 404;
  applicationStatus?: number;
  errorMessageTranslationkey: string;
  handled: boolean = false;

  context: string;
  scope: string;

  constructor(message?: string) {
    super(message);
    this.name = AppError.name;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
