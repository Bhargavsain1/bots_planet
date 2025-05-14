import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import connectToDB from './config/dbConfig.js';
import authRoutes from './routes/authRoutes.js';
import botRoutes from './routes/botRoutes.js';
import customerSegmentRoutes from './routes/customerSegmentRoutes.js'; // Correct import
import { verifyToken } from './middleware/auth.js';


const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Atlas connection (direct)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://devuser:Hasman123@salesbotdatacluster.gsbt1qx.mongodb.net/bots_planet_data?retryWrites=true&w=majority&appName=SalesBotDataCluster';

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/customer-segments', customerSegmentRoutes); // Add customer segment routes

// Start the server
app.listen(PORT, (err) => {
  if (err) {
    console.error(`Error starting the server...\n>>${err}`);
  } else {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  }
});