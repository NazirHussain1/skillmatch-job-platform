# Clean Architecture Documentation

## Project Structure

```
server/
├── src/
│   ├── modules/              # Feature modules
│   │   ├── auth/            # Authentication module
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.routes.js
│   │   ├── users/           # User management module
│   │   │   ├── user.model.js
│   │   │   ├── user.repository.js
│   │   │   ├── user.service.js
│   │   │   ├── user.controller.js
│   │   │   ├── user.dto.js
│   │   │   └── user.routes.js
│   │   ├── jobs/            # Job management module
│   │   │   ├── job.model.js
│   │   │   ├── job.repository.js
│   │   │   ├── job.service.js
│   │   │   ├── job.controller.js
│   │   │   ├── job.dto.js
│   │   │   └── job.routes.js
│   │   └── applications/    # Application management module
│   │       ├── application.model.js
│   │       ├── application.repository.js
│   │       ├── application.service.js
│   │       ├── application.controller.js
│   │       ├── application.dto.js
│   │       └── application.routes.js
│   ├── middlewares/         # Global middlewares
│   │   ├── auth.js         # Authentication & authorization
│   │   ├── errorHandler.js # Error handling
│   │   └── validate.js     # Validation middleware
│   ├── utils/              # Utility functions
│   │   ├── ApiResponse.js  # Standard response format
│   │   ├── ApiError.js     # Custom error class
│   │   └── asyncHandler.js # Async wrapper
│   ├── repositories/       # Base repository
│   │   └── base.repository.js
│   ├── validations/        # Input validation schemas
│   │   ├── auth.validation.js
│   │   ├── user.validation.js
│   │   ├── job.validation.js
│   │   └── application.validation.js
│   ├── config/             # Configuration files
│   │   ├── database.js     # MongoDB connection
│   │   └── constants.js    # App constants
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
```

## Architecture Layers

### 1. Controller Layer
- Handles HTTP requests and responses
- Validates input using validation middleware
- Calls service layer methods
- Returns standardized API responses

### 2. Service Layer
- Contains business logic
- Orchestrates operations between repositories
- Handles data transformation using DTOs
- Throws custom errors for error handling

### 3. Repository Layer
- Abstracts database operations
- Provides reusable query methods
- Extends base repository for common operations
- Returns raw database models

### 4. Model Layer
- Defines database schemas
- Contains schema-level validations
- Includes instance methods (e.g., password matching)
- Handles pre/post hooks

## Design Patterns

### DTO (Data Transfer Object)
- Standardizes data structure between layers
- Filters sensitive information
- Provides type safety
- Located in `*.dto.js` files

### Repository Pattern
- Abstracts data access logic
- Provides consistent interface for database operations
- Makes testing easier with mock repositories
- Base repository provides common CRUD operations

### Service Pattern
- Encapsulates business logic
- Reusable across different controllers
- Handles complex operations and validations
- Maintains single responsibility principle

## API Response Format

### Success Response
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## HTTP Status Codes

- 200: OK - Successful GET, PUT, DELETE
- 201: Created - Successful POST
- 400: Bad Request - Validation errors
- 401: Unauthorized - Authentication required
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource not found
- 409: Conflict - Duplicate resource
- 500: Internal Server Error - Server errors

## Validation

Input validation uses `express-validator`:
- Validation schemas in `src/validations/`
- Middleware checks validation results
- Returns formatted error messages
- Validates request body, params, and query

## Error Handling

Centralized error handling:
- Custom `ApiError` class for operational errors
- Global error handler middleware
- Automatic error formatting
- Development vs production error details

## Authentication & Authorization

JWT-based authentication:
- `protect` middleware: Verifies JWT token
- `authorize` middleware: Checks user roles
- Token generated on login/signup
- User attached to `req.user`

## Running the Server

```bash
# Install dependencies
npm install

# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## Environment Variables

Required in `.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Testability**: Easy to unit test each layer independently
3. **Maintainability**: Clear structure makes code easy to understand
4. **Scalability**: Easy to add new features following the same pattern
5. **Reusability**: Services and repositories can be reused
6. **Type Safety**: DTOs provide consistent data structures
7. **Error Handling**: Centralized and consistent error responses
