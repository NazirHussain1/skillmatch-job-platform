const mongoose = require('mongoose');

const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const getReadiness = () => {
  const missingEnvVars = REQUIRED_ENV_VARS.filter((varName) => !process.env[varName]);
  const databaseConnected = mongoose.connection.readyState === 1;
  const ready = missingEnvVars.length === 0 && databaseConnected;

  return {
    ready,
    status: ready ? 'ready' : 'not_ready',
    checks: {
      database: databaseConnected ? 'connected' : 'disconnected',
      environment: missingEnvVars.length === 0 ? 'configured' : 'missing_required_values'
    },
    missingEnvVars,
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  REQUIRED_ENV_VARS,
  getReadiness
};
