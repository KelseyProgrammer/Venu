import mongoose, { Document, Schema } from 'mongoose';

export interface IArtist extends Document {
  // Basic Information
  name: string;
  bio: string;
  genre: string[];
  
  // Contact & Social Media
  email: string;
  phone?: string;
  instagram?: string;
  spotify?: string;
  appleMusic?: string;
  website?: string;
  youtube?: string;
  tiktok?: string;
  
  // Location & Availability
  location: string; // General area (e.g., "Downtown", "East Side")
  availability: string; // e.g., "Available this month"
  priceRange: string; // e.g., "$200-400"
  
  // Performance Details
  setLength?: string; // e.g., "1 hour", "45 minutes"
  equipmentNeeds?: string; // e.g., "PA system", "Backline provided"
  pricing?: string; // Additional pricing information
  typicalSetlist?: string; // Typical songs or setlist structure
  soundRequirements?: string; // Specific sound requirements
  
  // Portfolio
  pastPerformances?: string; // Notable venues and performances
  reviews?: string; // Reviews and testimonials
  rating: number;
  portfolioImages?: string[]; // Array of portfolio image URLs
  portfolioVideos?: string[]; // Array of portfolio video URLs
  followers: string; // e.g., "3.2K"
  totalGigs: number;
  totalEarnings: number;
  
  // Calendar Integration
  unavailableDates?: Date[]; // Array of unavailable dates
  availableDates?: Date[]; // Array of explicitly available dates
  preferredBookingDays?: string[]; // Preferred days for bookings
  bookingLeadTime?: string; // e.g., "1 week", "2 weeks"
  cancellationPolicy?: string; // Cancellation policy description
  
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
    enum: ['Jazz', 'Rock', 'Electronic', 'Folk', 'Blues', 'Pop', 'Country', 'Hip Hop', 'Classical', 'Reggae', 'Punk', 'Alternative', 'Indie', 'Metal', 'R&B', 'Soul', 'Funk', 'World', 'Experimental'],
  }],
  
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
  youtube: {
    type: String,
    trim: true,
  },
  tiktok: {
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
  
  // Performance Details
  setLength: {
    type: String,
    trim: true,
  },
  equipmentNeeds: {
    type: String,
    trim: true,
  },
  pricing: {
    type: String,
    trim: true,
  },
  typicalSetlist: {
    type: String,
    trim: true,
  },
  soundRequirements: {
    type: String,
    trim: true,
  },
  
  // Portfolio
  pastPerformances: {
    type: String,
    trim: true,
  },
  reviews: {
    type: String,
    trim: true,
  },
  portfolioImages: [{
    type: String,
    trim: true,
  }],
  portfolioVideos: [{
    type: String,
    trim: true,
  }],
  
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
  
  // Calendar Integration
  unavailableDates: [{
    type: Date,
  }],
  availableDates: [{
    type: Date,
  }],
  preferredBookingDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  }],
  bookingLeadTime: {
    type: String,
    trim: true,
  },
  cancellationPolicy: {
    type: String,
    trim: true,
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

// Indexes for better query performance
artistSchema.index({ userId: 1 });
artistSchema.index({ genre: 1 });
artistSchema.index({ location: 1 });
artistSchema.index({ rating: -1 });
artistSchema.index({ totalGigs: -1 });
artistSchema.index({ isActive: 1 });
artistSchema.index({ name: 'text', bio: 'text' }); // Text search index

export const Artist = mongoose.model<IArtist>('Artist', artistSchema);
