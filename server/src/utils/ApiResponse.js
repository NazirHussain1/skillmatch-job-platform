/**
 * Standard API Response Format
 */
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  static success(data, message = 'Success', statusCode = 200) {
    return new ApiResponse(statusCode, data, message);
  }

  static created(data, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
  }

  static error(message, statusCode = 500, errors = null) {
    const response = new ApiResponse(statusCode, null, message);
    if (errors) response.errors = errors;
    return response;
  }
}

export default ApiResponse;
