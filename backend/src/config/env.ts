import dotenv from 'dotenv';
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret === 'replace_with_a_long_random_secret') {
  throw new Error('Set a unique JWT_SECRET in backend/.env before starting the API.');
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  resendApiKey: process.env.RESEND_API_KEY || '',
  emailFrom: process.env.EMAIL_FROM || 'LifeLink Network <notifications@lifelink.org>',
};
