const AppError = require('./appError');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;

  if (handleValidationErrorDB(error)) error = handleValidationErrorDB(error);

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
};

const handleValidationErrorDB = err => {
  if (!err.errors) return;

  let errors = Object.values(err.errors).map(el => {
    if (el.name === 'ValidatorError') return el.message;
  });
  if (errors.length === 0) return;

  let messages = errors.join('. ');
  messages = `Invalid input data. ${messages}`;

  return new AppError(messages, 400);
};
