import Joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  MONGODB_URI: Joi.string().required().description('MongoDB connection string'),
  JWT_SECRET: Joi.string().required().min(32).description('JWT secret key'),
  JWT_EXPIRE: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().required().min(32).description('JWT refresh secret'),
  JWT_REFRESH_EXPIRE: Joi.string().default('7d'),
  JWT_EMAIL_SECRET: Joi.string().required().min(32).description('JWT email verification secret'),
  JWT_EMAIL_EXPIRE: Joi.string().default('1h'),
  COOKIE_EXPIRE: Joi.number().default(7),
  EMAIL_HOST: Joi.string().default('smtp.gmail.com'),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_USER: Joi.string().email(),
  EMAIL_PASSWORD: Joi.string(),
  EMAIL_FROM: Joi.string().email(),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),
  MAX_LOGIN_ATTEMPTS: Joi.number().default(5),
  LOCK_TIME: Joi.number().default(2 * 60 * 60 * 1000), // 2 hours
  RATE_LIMIT_WINDOW: Joi.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX: Joi.number().default(100),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_EXPIRE,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRE,
    emailSecret: envVars.JWT_EMAIL_SECRET,
    emailExpirationMinutes: envVars.JWT_EMAIL_EXPIRE,
    cookieExpire: envVars.COOKIE_EXPIRE,
  },
  email: {
    host: envVars.EMAIL_HOST,
    port: envVars.EMAIL_PORT,
    auth: {
      user: envVars.EMAIL_USER,
      pass: envVars.EMAIL_PASSWORD,
    },
    from: envVars.EMAIL_FROM,
  },
  security: {
    maxLoginAttempts: envVars.MAX_LOGIN_ATTEMPTS,
    lockTime: envVars.LOCK_TIME,
    rateLimitWindow: envVars.RATE_LIMIT_WINDOW,
    rateLimitMax: envVars.RATE_LIMIT_MAX,
  },
  frontendUrl: envVars.FRONTEND_URL,
};
