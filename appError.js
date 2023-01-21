class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `this.statusCode`.startsWith(400) ? 'fail' : 'error';
  }
}

module.exports = AppError;
