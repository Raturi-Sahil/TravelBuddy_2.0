class ApiError extends Error {
  statusCode: number;
  success: boolean;
  errors: any[];
  stack?: string;

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: any[] = [],
    stack: string = ""
  ) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
      stack:
        process.env.NODE_ENV === "TEST" ? this.stack : undefined,
    };
  }
}

export default ApiError;
