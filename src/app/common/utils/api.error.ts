class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }

  static badRequest(message = "bad Request") {
    return new ApiError(400, message);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static conflict(message = "Conflict") {
    return new ApiError(409, message);
  }

  static notFound(message = "notFound") {
    return new ApiError(404, message);
  }

  static serverError(message = "internal server error" ) {
    return new ApiError(500, message)
  }
}

export default ApiError;
