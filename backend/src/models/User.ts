import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'fan' | 'artist' | 'promoter' | 'door' | 'location';
  firstName: string;
  lastName: string;
  phone?: string;
  isVerified: boolean;
  fcmToken?: string; // Firebase Cloud Messaging token for push notifications
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['fan', 'artist', 'promoter', 'door', 'location'],
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  fcmToken: {
    type: String,
    sparse: true, // Allows multiple documents without this field
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isVerified: 1 });
// Compound index for role-based queries with verification status
userSchema.index({ role: 1, isVerified: 1 });
// Compound index for search functionality
userSchema.index({ 
  firstName: 'text', 
  lastName: 'text', 
  email: 'text' 
}, {
  weights: {
    firstName: 10,
    lastName: 10,
    email: 5
  }
});

export default mongoose.model<IUser>('User', userSchema);
