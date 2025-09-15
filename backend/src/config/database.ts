import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    let mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Fix the broken MONGODB_URI if it has line breaks
    mongoURI = mongoURI.replace(/\n/g, '').replace(/\r/g, '');
    
    console.log('🔌 Attempting to connect to MongoDB...');
    console.log('📡 URI:', mongoURI.substring(0, 50) + '...');


    const options = {
      // Performance optimized connection settings
      maxPoolSize: 20, // Increased for better concurrency
      minPoolSize: 5, // Maintain minimum connections
      serverSelectionTimeoutMS: 5000, // Faster server selection
      socketTimeoutMS: 30000, // Reduced timeout for better responsiveness
      connectTimeoutMS: 5000, // Faster initial connection
      maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
      heartbeatFrequencyMS: 10000, // More frequent heartbeat checks
      // Performance optimizations
      retryWrites: true,
      retryReads: true,
      // bufferMaxEntries has been removed in newer MongoDB drivers
      // Mongoose 6+ handles buffering automatically
    };

    await mongoose.connect(mongoURI, options);
    
    console.log('✅ MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB disconnected');
    });

    mongoose.connection.on('connected', () => {
      console.log('🔗 MongoDB connection established');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down gracefully...');
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('💡 Please check your MONGODB_URI in the .env file');
    process.exit(1);
  }
};

export default connectDB;
