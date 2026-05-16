export class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.name = "AppError"
    this.statusCode = statusCode
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400)
    this.name = "ValidationError"
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409)
    this.name = "ConflictError"
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Short code not found") {
    super(message, 404)
    this.name = "NotFoundError"
  }
}
