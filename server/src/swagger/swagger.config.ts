/**
 * Swagger/OpenAPI Configuration
 * Full API documentation
 */

export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SkillMatch AI API',
    version: '1.0.0',
    description: 'AI-powered skill-based hiring platform API documentation',
    contact: {
      name: 'SkillMatch AI Team',
      email: 'support@skillmatch.ai'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server'
    },
    {
      url: 'https://api.skillmatch.ai',
      description: 'Production server'
    }
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints'
    },
    {
      name: 'Users',
      description: 'User management endpoints'
    },
    {
      name: 'Jobs',
      description: 'Job posting and management endpoints'
    },
    {
      name: 'Applications',
      description: 'Job application endpoints'
    },
    {
      name: 'Matching',
      description: 'AI-powered matching and recommendations'
    },
    {
      name: 'Search',
      description: 'Advanced job search endpoints'
    },
    {
      name: 'Analytics',
      description: 'Analytics and reporting endpoints'
    },
    {
      name: 'Notifications',
      description: 'Real-time notification endpoints'
    },
    {
      name: 'Uploads',
      description: 'File upload endpoints'
    },
    {
      name: 'Health',
      description: 'Health check and monitoring endpoints'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token'
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'Refresh token stored in HTTP-only cookie'
      }
    },
    schemas: {
      // User Schemas
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          role: { type: 'string', enum: ['job_seeker', 'employer', 'admin'], example: 'job_seeker' },
          avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
          bio: { type: 'string', example: 'Experienced software developer' },
          skills: { type: 'array', items: { type: 'string' }, example: ['JavaScript', 'React', 'Node.js'] },
          experienceLevel: { type: 'string', enum: ['entry', 'mid', 'senior'], example: 'mid' },
          companyName: { type: 'string', example: 'Tech Corp' },
          companyLogo: { type: 'string', example: 'https://example.com/logo.jpg' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      
      // Job Schemas
      Job: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          title: { type: 'string', example: 'Senior Full Stack Developer' },
          employerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
          companyName: { type: 'string', example: 'Tech Corp' },
          location: { type: 'string', example: 'San Francisco, CA' },
          salary: { type: 'string', example: '$120k - $180k' },
          salaryRange: { type: 'number', example: 150000 },
          type: { type: 'string', enum: ['Full-time', 'Part-time', 'Contract', 'Remote'], example: 'Full-time' },
          experienceLevel: { type: 'string', enum: ['entry', 'mid', 'senior'], example: 'senior' },
          description: { type: 'string', example: 'We are looking for...' },
          requiredSkills: { type: 'array', items: { type: 'string' }, example: ['JavaScript', 'React', 'Node.js'] },
          isActive: { type: 'boolean', example: true },
          views: { type: 'number', example: 150 },
          applicationCount: { type: 'number', example: 25 },
          postedAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      
      // Application Schemas
      Application: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          jobId: { type: 'string', example: '507f1f77bcf86cd799439011' },
          userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
          jobTitle: { type: 'string', example: 'Senior Full Stack Developer' },
          companyName: { type: 'string', example: 'Tech Corp' },
          status: { 
            type: 'string', 
            enum: ['Pending', 'Reviewing', 'Interviewing', 'Accepted', 'Rejected'],
            example: 'Pending'
          },
          matchScore: { type: 'number', example: 85 },
          appliedAt: { type: 'string', format: 'date-time' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      
      // Match Result Schema
      MatchResult: {
        type: 'object',
        properties: {
          matchScore: { type: 'number', example: 85 },
          matchPercentage: { type: 'number', example: 75 },
          matchedSkills: { type: 'array', items: { type: 'string' }, example: ['JavaScript', 'React'] },
          missingSkills: { type: 'array', items: { type: 'string' }, example: ['Docker', 'Kubernetes'] },
          totalRequired: { type: 'number', example: 5 },
          experienceMatch: { type: 'boolean', example: true }
        }
      },
      
      // Notification Schema
      Notification: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
          type: { 
            type: 'string',
            enum: ['application_submitted', 'application_reviewed', 'application_accepted', 'application_rejected'],
            example: 'application_submitted'
          },
          title: { type: 'string', example: 'New Application Received' },
          message: { type: 'string', example: 'You received a new application' },
          isRead: { type: 'boolean', example: false },
          relatedEntityId: { type: 'string', example: '507f1f77bcf86cd799439011' },
          relatedEntityType: { type: 'string', enum: ['Job', 'Application', 'User'], example: 'Application' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      
      // Response Schemas
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation successful' },
          data: { type: 'object' }
        }
      },
      
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message' },
          errors: { type: 'array', items: { type: 'object' } }
        }
      },
      
      PaginationMeta: {
        type: 'object',
        properties: {
          total: { type: 'number', example: 100 },
          page: { type: 'number', example: 1 },
          limit: { type: 'number', example: 20 },
          pages: { type: 'number', example: 5 }
        }
      }
    },
    
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      },
      ForbiddenError: {
        description: 'User does not have permission to access this resource',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      },
      ValidationError: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      },
      RateLimitError: {
        description: 'Too many requests',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      }
    },
    
    parameters: {
      PageParam: {
        name: 'page',
        in: 'query',
        description: 'Page number',
        schema: { type: 'integer', minimum: 1, default: 1 }
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        description: 'Number of items per page',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
      },
      SearchParam: {
        name: 'search',
        in: 'query',
        description: 'Search query',
        schema: { type: 'string' }
      },
      SortParam: {
        name: 'sortBy',
        in: 'query',
        description: 'Sort field',
        schema: { type: 'string', enum: ['relevance', 'date', 'salary', 'popularity'] }
      }
    }
  },
  
  security: [
    {
      bearerAuth: []
    }
  ]
};

export const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ['./src/modules/**/*.routes.js', './src/modules/**/*.routes.ts']
};

export default swaggerOptions;
