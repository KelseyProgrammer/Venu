import mongoose, { Document, Schema } from 'mongoose';

export interface ILocation extends Document {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  capacity: number;
  description?: string;
  amenities: string[];
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  images: string[];
  rating: number;
  tags: string[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'USA',
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  description: {
    type: String,
    trim: true,
  },
  amenities: [{
    type: String,
    trim: true,
  }],
  contactPerson: {
    type: String,
    required: true,
    trim: true,
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  contactPhone: {
    type: String,
    required: true,
    trim: true,
  },
  images: [{
    type: String,
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
locationSchema.index({ city: 1, state: 1 });
locationSchema.index({ capacity: 1 });
locationSchema.index({ rating: -1 });
locationSchema.index({ tags: 1 });
locationSchema.index({ isActive: 1 });
locationSchema.index({ createdBy: 1 });
locationSchema.index({ createdAt: -1 });
// Compound indexes for common query patterns
locationSchema.index({ isActive: 1, city: 1, state: 1 });
locationSchema.index({ isActive: 1, capacity: 1 });
locationSchema.index({ isActive: 1, rating: -1 });
locationSchema.index({ createdBy: 1, isActive: 1 });
// Text search index for location names and descriptions
locationSchema.index({ 
  name: 'text',
  city: 'text',
  state: 'text',
  description: 'text',
  tags: 'text'
}, {
  weights: {
    name: 10,
    city: 8,
    state: 6,
    description: 3,
    tags: 2
  }
});

export default mongoose.model<ILocation>('Location', locationSchema);
