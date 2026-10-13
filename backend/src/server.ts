// LifeLink – Smart Blood Donor Network REST API Server
// Full-Stack AI & Data Science Engineering Project

import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import authRoutes from './routes/authRoutes';
import donorRoutes from './routes/donorRoutes';
import requestRoutes from './routes/requestRoutes';
import directoryRoutes from './routes/directoryRoutes';
import notificationRoutes from './routes/notificationRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

// Security and CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost and frontend client
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      return callback(null, true); // For dev & demo deployment flexibility
    },
    credentials: true,
  })
);

app.use(express.json());

// API Health Check & Metadata
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    project: 'LifeLink – Smart Blood Donor Network',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    aiEngine: 'Transparent ABO-Rh Haversine Multi-Factor Ranking Service',
    database: 'Prisma Relational ORM',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`  LifeLink Smart Blood Donor Network REST API Server`);
    console.log(`  Listening at: http://localhost:${config.port}`);
    console.log(`  Health Check: http://localhost:${config.port}/api/health`);
    console.log(`====================================================`);
  });
}
