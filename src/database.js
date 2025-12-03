import mongoose from 'mongoose';
import { MONGODB_URI } from './config.js';

export const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI is missing.');
      process.exit(1);
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};
