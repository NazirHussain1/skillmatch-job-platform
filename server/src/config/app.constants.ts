/**
 * Application Constants
 * Centralized configuration for the entire application
 */

// User Roles
export const USER_ROLES = {
  JOB_SEEKER: 'job_seeker',
  EMPLOYER: 'employer',
  ADMIN: 'admin'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Job Types
export const JOB_TYPES = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  REMOTE: 'Remote'
} as const;

export type JobType = typeof JOB_TYPES[keyof typeof JOB_TYPES];

// Experience Levels
export const EXPERIENCE_LEVELS = {
  ENTRY: 'entry',
  MID: 'mid',
  SENIOR: 'senior'
} as const;

export type ExperienceLevel = typeof EXPERIENCE_LEVELS[keyof typeof EXPERIENCE_LEVELS];

// Application Status
export const APPLICATION_STATUS = {
  PENDING: 'Pending',
  REVIEWING: 'Reviewing',
  INTERVIEWING: 'Interviewing',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected'
} as const;

export type ApplicationStatus = typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS];

// Notification Types
export const NOTIFICATION_TYPES = {
  APPLICATION_SUBMITTED: 'application_submitted',
  APPLICATION_REVIEWED: 'application_reviewed',
  APPLICATION_ACCEPTED: 'application_accepted',
  APPLICATION_REJECTED: 'application_rejected',
  NEW_MESSAGE: 'new_message',
  JOB_RECOMMENDATION: 'job_recommendation'
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

// Matching Engine Constants
export const MATCHING_CONSTANTS = {
  WEIGHTS: {
    EXACT_MATCH: 2.0,
    CATEGORY_MATCH: 1.5,
    RELATED_MATCH: 1.0
  },
  EXPERIENCE_MULTIPLIERS: {
    EXACT: 1.0,
    ONE_LEVEL_DIFF: 0.8,
    TWO_LEVEL_DIFF: 0.5
  },
  THRESHOLDS: {
    JOB_RECOMMENDATION: 60,
    CANDIDATE_RECOMMENDATION: 70,
    HIGH_MATCH: 80
  }
} as const;

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: {
    RESUME: 5 * 1024 * 1024, // 5MB
    LOGO: 2 * 1024 * 1024    // 2MB
  },
  ALLOWED_TYPES: {
    RESUME: ['application/pdf'],
    LOGO: ['image/jpeg', 'image/png', 'image/webp']
  },
  ALLOWED_EXTENSIONS: {
    RESUME: ['.pdf'],
    LOGO: ['.jpg', '.jpeg', '.png', '.webp']
  }
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 3600,          // 1 hour
  VERY_LONG: 86400     // 24 hours
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
    MAX_REQUESTS: 100
  },
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
    MAX_REQUESTS: 5
  },
  UPLOAD: {
    WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
    MAX_REQUESTS: 10
  },
  SEARCH: {
    WINDOW_MS: 1 * 60 * 1000,   // 1 minute
    MAX_REQUESTS: 30
  }
} as const;

// JWT Configuration
export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  EMAIL_TOKEN_EXPIRY: '24h',
  ALGORITHM: 'HS256'
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false
  },
  EMAIL: {
    MAX_LENGTH: 255
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100
  },
  BIO: {
    MAX_LENGTH: 500
  },
  JOB_TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100
  },
  JOB_DESCRIPTION: {
    MIN_LENGTH: 50,
    MAX_LENGTH: 5000
  },
  SKILLS: {
    MIN_COUNT: 1,
    MAX_COUNT: 50,
    MAX_LENGTH_PER_SKILL: 50
  }
} as const;

// Search History
export const SEARCH_HISTORY = {
  MAX_ENTRIES: 10
} as const;

// Notification Settings
export const NOTIFICATION_SETTINGS = {
  MAX_UNREAD: 100,
  AUTO_DELETE_AFTER_DAYS: 90
} as const;

// Related Skills Mapping
export const RELATED_SKILLS: Record<string, string[]> = {
  'javascript': ['typescript', 'node', 'react', 'vue', 'angular', 'express', 'next'],
  'typescript': ['javascript', 'node', 'react', 'angular', 'nest'],
  'python': ['django', 'flask', 'fastapi', 'pandas', 'numpy', 'scikit-learn'],
  'java': ['spring', 'hibernate', 'maven', 'gradle', 'kotlin'],
  'react': ['javascript', 'typescript', 'redux', 'next', 'gatsby'],
  'vue': ['javascript', 'typescript', 'nuxt', 'vuex'],
  'angular': ['javascript', 'typescript', 'rxjs', 'ngrx'],
  'node': ['javascript', 'typescript', 'express', 'nest', 'fastify'],
  'express': ['node', 'javascript', 'typescript'],
  'nest': ['node', 'typescript', 'express'],
  'django': ['python', 'flask', 'fastapi'],
  'flask': ['python', 'django', 'fastapi'],
  'fastapi': ['python', 'django', 'flask'],
  'spring': ['java', 'kotlin', 'hibernate'],
  'sql': ['mysql', 'postgresql', 'sqlite', 'database'],
  'mysql': ['sql', 'postgresql', 'database', 'mariadb'],
  'postgresql': ['sql', 'mysql', 'database'],
  'mongodb': ['database', 'nosql', 'mongoose'],
  'redis': ['cache', 'database', 'nosql'],
  'aws': ['cloud', 'azure', 'gcp', 'devops', 'terraform'],
  'azure': ['cloud', 'aws', 'gcp', 'devops'],
  'gcp': ['cloud', 'aws', 'azure', 'devops'],
  'docker': ['kubernetes', 'devops', 'ci/cd', 'jenkins', 'containerization'],
  'kubernetes': ['docker', 'devops', 'ci/cd', 'helm'],
  'git': ['github', 'gitlab', 'bitbucket', 'version-control'],
  'ci/cd': ['jenkins', 'github-actions', 'gitlab-ci', 'devops'],
  'terraform': ['aws', 'azure', 'gcp', 'infrastructure', 'devops'],
  'graphql': ['api', 'rest', 'apollo'],
  'rest': ['api', 'graphql', 'http']
};

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'Not authorized to access this resource',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  TOKEN_REVOKED: 'Token has been revoked',
  
  // User
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  INVALID_USER_ROLE: 'Invalid user role',
  
  // Job
  JOB_NOT_FOUND: 'Job not found',
  JOB_INACTIVE: 'Job is no longer active',
  
  // Application
  APPLICATION_NOT_FOUND: 'Application not found',
  ALREADY_APPLIED: 'You have already applied to this job',
  INVALID_STATUS_TRANSITION: 'Invalid status transition',
  
  // Validation
  VALIDATION_ERROR: 'Validation failed',
  INVALID_EMAIL: 'Invalid email format',
  WEAK_PASSWORD: 'Password does not meet requirements',
  REQUIRED_FIELD: 'This field is required',
  
  // File Upload
  FILE_TOO_LARGE: 'File size exceeds maximum allowed',
  INVALID_FILE_TYPE: 'Invalid file type',
  UPLOAD_FAILED: 'File upload failed',
  
  // Rate Limiting
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',
  
  // Server
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  SIGNUP_SUCCESS: 'User registered successfully',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  
  // User
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  
  // Job
  JOB_CREATED: 'Job created successfully',
  JOB_UPDATED: 'Job updated successfully',
  JOB_DELETED: 'Job deleted successfully',
  
  // Application
  APPLICATION_SUBMITTED: 'Application submitted successfully',
  APPLICATION_UPDATED: 'Application status updated successfully',
  APPLICATION_DELETED: 'Application removed successfully',
  
  // File Upload
  FILE_UPLOADED: 'File uploaded successfully',
  
  // General
  OPERATION_SUCCESS: 'Operation completed successfully'
} as const;

// API Versioning
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

// Environment
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  STAGING: 'staging',
  PRODUCTION: 'production'
} as const;

export type Environment = typeof ENVIRONMENTS[keyof typeof ENVIRONMENTS];

// Export all constants as a single object for convenience
export const CONSTANTS = {
  USER_ROLES,
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  APPLICATION_STATUS,
  NOTIFICATION_TYPES,
  HTTP_STATUS,
  MATCHING_CONSTANTS,
  FILE_UPLOAD,
  PAGINATION,
  CACHE_TTL,
  RATE_LIMITS,
  JWT_CONFIG,
  VALIDATION,
  SEARCH_HISTORY,
  NOTIFICATION_SETTINGS,
  RELATED_SKILLS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  API_VERSION,
  API_PREFIX,
  ENVIRONMENTS
} as const;

export default CONSTANTS;
