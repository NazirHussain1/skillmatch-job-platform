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
    { name: 'Authentication', description: 'User authentication and authorization endpoints' },
    { name: 'Users', description: 'User management endpoints' },
    { name: 'Jobs', description: 'Job posting and management endpoints' },
    { name: 'Applications', description: 'Job application endpoints' },
    { name: 'Matching', description: 'AI-powered matching and recommendations' },
    { name: 'Search', description: 'Advanced job search endpoints' },
    { name: 'Analytics', description: 'Analytics and reporting endpoints' },
    { name: 'Notifications', description: 'Real-time notification endpoints' },
    { name: 'Uploads', description: 'File upload endpoints' },
    { name: 'Health', description: 'Health check and monitoring endpoints' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token'
      }
    }
  },
  security: [{ bearerAuth: [] }]
};

export const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ['./src/modules/**/*.routes.js']
};

export default swaggerOptions;
