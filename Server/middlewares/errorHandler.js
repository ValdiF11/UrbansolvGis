function errorHandler(err, req, res, next) {
  let status = err.status;
  let message = err.message;
  switch (err.name) {
    case "SequelizeValidationError":
      status = 400;
      message = err.errors.map((el) => el.message);
      break;
    case "SequelizeUniqueConstraintError":
      status = 400;
      message = err.errors.map((el) => el.message);
      break;
    case "Invalid Token":
      status = 401;
      message = "Error Authentication";
      break;
    case "Forbidden":
      status = 403;
      message = "Forbidden Access";
      break;
    case "Not Found":
      status = 404;
      message = "Data Not Found";
      break;
    default:
      status = 500;
      message = "Internal Server Error";
      break;
  }
  res.status(status).json({ message });
}

module.exports = errorHandler;
