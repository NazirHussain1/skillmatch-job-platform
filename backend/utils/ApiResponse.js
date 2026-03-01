// Standard API response format
class ApiResponse {
  constructor(success, message, data = null, statusCode = 200) {
    this.success = success;
    this.message = message;
    if (data !== null) {
      this.data = data;
    }
    this.statusCode = statusCode;
  }

  static success(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(true, message, data, statusCode));
  }

  static error(res, message, statusCode = 500) {
    return res.status(statusCode).json(new ApiResponse(false, message, null, statusCode));
  }
}

module.exports = ApiResponse;
