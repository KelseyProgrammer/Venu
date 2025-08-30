import mongoose, { Document, Schema } from 'mongoose';

export interface IArtist extends Document {
  // Basic Information
  name: string;
  bio: string;
  genre: string[];
  profileImage: string;
  
  // Contact & Social Media
  email: string;
  phone?: string;
  instagram?: string;
  spotify?: string;
  appleMusic?: string;
  website?: string;
  
  // Location & Availability
  location: string; // General area (e.g., "Downtown", "East Side")
  availability: string; // e.g., "Available this month"
  priceRange: string; // e.g., "$200-400"
  
  // Performance Metrics
  rating: number;
  followers: string; // e.g., "3.2K"
  totalGigs: number;
  totalEarnings: number;
  
  // User Reference
  userId: mongoose.Types.ObjectId;
  
  // Status
  isActive: boolean;
  isVerified: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const artistSchema = new Schema<IArtist>({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
  },
  bio: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  genre: [{
    type: String,
    required: true,
    enum: ['Jazz', 'Rock', 'Electronic', 'Folk', 'Blues', 'Pop', 'Country', 'Hip Hop', 'Classical', 'Reggae', 'Punk'],
  }],
  profileImage: {
    type: String,
    default: '/images/BandFallBack.PNG',
  },
  
  // Contact & Social Media
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  instagram: {
    type: String,
    trim: true,
  },
  spotify: {
    type: String,
    trim: true,
  },
  appleMusic: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  
  // Location & Availability
  location: {
    type: String,
    required: true,
    trim: true,
  },
  availability: {
    type: String,
    required: true,
    trim: true,
  },
  priceRange: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Performance Metrics
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  followers: {
    type: String,
    default: '0',
  },
  totalGigs: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // User Reference
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
artistSchema.index({ name: 1 });
artistSchema.index({ genre: 1 });
artistSchema.index({ location: 1 });
artistSchema.index({ rating: -1 });
artistSchema.index({ isActive: 1 });
artistSchema.index({ userId: 1 });

export default mongoose.model<IArtist>('Artist', artistSchema);
