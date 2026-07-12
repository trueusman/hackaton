require('dotenv').config();

// Render (and most PaaS dashboards) set an env var to an empty string "" when
// its field is left blank in the UI - that's a *set* value, not `undefined`,
// so a plain `??` fallback silently accepts it and Mongoose then fails deep
// in its connection-string parser with a confusing "Invalid scheme" error.
// Treating '' the same as unset here surfaces a clear, actionable error at
// startup instead.
const required = (name, fallback) => {
  const raw = process.env[name];
  const value = raw === undefined || raw === '' ? fallback : raw;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),

  MONGO_URI: required('MONGO_URI', 'mongodb://127.0.0.1:27017/maintainiq'),

  JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET', 'dev_access_secret_change_me'),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_me'),
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_MS: 7 * 24 * 60 * 60 * 1000,

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  PUBLIC_APP_URL: process.env.PUBLIC_APP_URL || process.env.CLIENT_URL || 'http://localhost:5173',

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-flash-latest',

  isProduction: (process.env.NODE_ENV || 'development') === 'production',
};

// Fail loudly and specifically in production if MONGO_URI wasn't actually
// provided by the platform (as opposed to Mongoose's generic parser error
// deep in a stack trace, which is what happens otherwise).
if (env.isProduction && !/^mongodb(\+srv)?:\/\//.test(env.MONGO_URI)) {
  throw new Error(
    'MONGO_URI is missing or invalid in production. Set it in your Render service\'s Environment tab to your ' +
      'MongoDB Atlas connection string (starts with mongodb+srv://).',
  );
}

module.exports = env;
