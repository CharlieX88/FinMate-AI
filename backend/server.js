import './config/env.js'; // ⚠️ MUST be first import — env load karta hai

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import creditRoutes from './routes/creditRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

connectDB();

const app = express();

// ---- Middleware ----
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---- Health check ----
app.get('/', (req, res) => {
  res.json({ message: 'AI Finance Manager API is running 🚀' });
});

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/chats', chatRoutes);

// ---- Error handlers ----
app.use(notFound);
app.use(errorHandler);

// ---- Start ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});