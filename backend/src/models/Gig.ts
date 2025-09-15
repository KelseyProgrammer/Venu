import mongoose, { Document, Schema } from 'mongoose';

export interface IGig extends Document {
  gigId: string;
  eventName: string;
  eventDate: Date;
  eventTime: string;
  eventGenre: string;
  ticketCapacity: number;
  ticketPrice: number;
  selectedLocation?: mongoose.Types.ObjectId;
  selectedPromoter?: mongoose.Types.ObjectId;
  promoterEmail?: string;
  promoterPercentage?: number;
  selectedDoorPerson?: mongoose.Types.ObjectId;
  doorPersonEmail: string;
  requirements: Array<{
    text: string;
    checked: boolean;
  }>;
  bands: Array<{
    name: string;
    genre: string;
    setTime: string;
    percentage: number;
    email: string;
    confirmed: boolean;
  }>;
  guarantee: number;
  numberOfBands: number;
  status: 'draft' | 'pending-confirmation' | 'posted' | 'live' | 'completed';
  rating: number;
  tags: string[];
  ticketsSold: number;
  image: string;
  bonusTiers: {
    tier1: { amount: number; threshold: number; color: string };
    tier2: { amount: number; threshold: number; color: string };
    tier3: { amount: number; threshold: number; color: string };
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const gigSchema = new Schema<IGig>({
  gigId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  eventName: {
    type: String,
    required: true,
    trim: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  eventTime: {
    type: String,
    required: true,
  },
  eventGenre: {
    type: String,
    required: true,
  },
  ticketCapacity: {
    type: Number,
    required: true,
    min: 1,
  },
  ticketPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  selectedLocation: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
  },
  selectedPromoter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  promoterEmail: {
    type: String,
    trim: true,
  },
  promoterPercentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  selectedDoorPerson: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  doorPersonEmail: {
    type: String,
    required: true,
    trim: true,
  },
  requirements: [{
    text: {
      type: String,
      required: true,
    },
    checked: {
      type: Boolean,
      default: false,
    },
  }],
  bands: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: String,
      required: true,
    },
    setTime: {
      type: String,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    confirmed: {
      type: Boolean,
      default: false, // Bands need to confirm before gig is posted
    },
  }],
  guarantee: {
    type: Number,
    required: true,
    min: 0,
  },
  numberOfBands: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: String,
    enum: ['draft', 'pending-confirmation', 'posted', 'live', 'completed'],
    default: 'draft',
  },
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
  ticketsSold: {
    type: Number,
    default: 0,
    min: 0,
  },
  image: {
    type: String,
    default: '/images/venu-logo.png',
  },
  bonusTiers: {
    tier1: {
      amount: { type: Number, required: true, min: 0 },
      threshold: { type: Number, required: true, min: 0 },
      color: { type: String, required: true },
    },
    tier2: {
      amount: { type: Number, required: true, min: 0 },
      threshold: { type: Number, required: true, min: 0 },
      color: { type: String, required: true },
    },
    tier3: {
      amount: { type: Number, required: true, min: 0 },
      threshold: { type: Number, required: true, min: 0 },
      color: { type: String, required: true },
    },
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
gigSchema.index({ eventDate: 1 });
gigSchema.index({ status: 1 });
gigSchema.index({ rating: -1 });
gigSchema.index({ tags: 1 });
gigSchema.index({ createdBy: 1 });
gigSchema.index({ selectedLocation: 1 });
gigSchema.index({ selectedPromoter: 1 });
gigSchema.index({ eventGenre: 1 });
gigSchema.index({ ticketCapacity: 1 });
gigSchema.index({ createdAt: -1 });
// Compound indexes for common query patterns
gigSchema.index({ status: 1, eventDate: 1 });
gigSchema.index({ selectedLocation: 1, eventDate: 1 });
gigSchema.index({ eventGenre: 1, status: 1 });
gigSchema.index({ createdBy: 1, status: 1 });
gigSchema.index({ selectedPromoter: 1, status: 1 });
// Text search index for event names and descriptions
gigSchema.index({ 
  eventName: 'text',
  eventGenre: 'text',
  tags: 'text'
}, {
  weights: {
    eventName: 10,
    eventGenre: 5,
    tags: 3
  }
});

// Generate unique gigId before saving
gigSchema.pre('save', async function(next) {
  if (!this.gigId) {
    // Generate a unique gigId using timestamp and random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.gigId = `GIG-${timestamp}-${randomString}`;
  }
  next();
});

export default mongoose.model<IGig>('Gig', gigSchema);
