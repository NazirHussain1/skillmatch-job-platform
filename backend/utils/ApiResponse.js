// Standard API response format
class ApiResponse {
  static success(message, data = null) {
    return {
      success: true,
      message,
      data
    };
  }

  static error(message, statusCode = 500) {
    return {
      success: false,
      message
    };
  }
}

module.exports = ApiResponse;
