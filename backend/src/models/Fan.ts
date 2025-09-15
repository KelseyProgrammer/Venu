import mongoose, { Document, Schema } from 'mongoose';

export interface IFan extends Document {
  // Basic Information (inherited from User)
  userId: mongoose.Types.ObjectId;
  
  // Fan-specific preferences
  favoriteGenres: string[];
  favoriteArtists: mongoose.Types.ObjectId[]; // Array of Artist IDs
  favoriteVenues: mongoose.Types.ObjectId[]; // Array of Location IDs
  notificationPreferences: string[];
  
  // Social Media
  instagram?: string;
  facebook?: string;
  twitter?: string;
  
  // Additional fan information
  bio?: string;
  age?: number;
  interests: string[];
  eventHistory?: string;
  
  // Status
  isActive: boolean;
  isVerified: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const fanSchema = new Schema<IFan>({
  // User reference
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  
  // Fan preferences
  favoriteGenres: [{
    type: String,
    enum: ['Jazz', 'Rock', 'Electronic', 'Folk', 'Blues', 'Pop', 'Country', 'Hip Hop', 'Classical', 'Reggae', 'Punk', 'Alternative', 'Indie', 'Metal', 'R&B', 'Soul', 'Funk', 'World', 'Experimental'],
  }],
  favoriteArtists: [{
    type: Schema.Types.ObjectId,
    ref: 'Artist',
  }],
  favoriteVenues: [{
    type: Schema.Types.ObjectId,
    ref: 'Location',
  }],
  notificationPreferences: [{
    type: String,
    enum: ['email', 'push', 'sms', 'in-app'],
  }],
  
  // Social Media
  instagram: {
    type: String,
    trim: true,
  },
  facebook: {
    type: String,
    trim: true,
  },
  twitter: {
    type: String,
    trim: true,
  },
  
  // Additional information
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  age: {
    type: Number,
    min: 13,
    max: 120,
  },
  interests: [{
    type: String,
    trim: true,
  }],
  eventHistory: {
    type: String,
    trim: true,
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

// Indexes for better query performance
fanSchema.index({ userId: 1 }, { unique: true });
fanSchema.index({ favoriteArtists: 1 });
fanSchema.index({ favoriteVenues: 1 });
fanSchema.index({ favoriteGenres: 1 });
fanSchema.index({ isActive: 1 });
fanSchema.index({ isVerified: 1 });

// Compound indexes for common queries
fanSchema.index({ isActive: 1, isVerified: 1 });
fanSchema.index({ favoriteArtists: 1, isActive: 1 });

export default mongoose.model<IFan>('Fan', fanSchema);
