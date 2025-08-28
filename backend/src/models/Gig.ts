import mongoose, { Document, Schema } from 'mongoose';

export interface IGig extends Document {
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
  }>;
  guarantee: number;
  numberOfBands: number;
  status: 'draft' | 'posted' | 'live' | 'completed';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const gigSchema = new Schema<IGig>({
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
    enum: ['draft', 'posted', 'live', 'completed'],
    default: 'draft',
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
gigSchema.index({ createdBy: 1 });
gigSchema.index({ selectedLocation: 1 });

export default mongoose.model<IGig>('Gig', gigSchema);
