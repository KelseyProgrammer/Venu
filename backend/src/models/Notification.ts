import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  id: string;
  from: {
    userId: string;
    email: string;
    role: string;
  };
  to: string; // User ID
  type: 'gig-invitation' | 'gig-confirmation-required' | 'booking-request' | 'status-update' | 'message' | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: Date;
  read: boolean;
  delivered: boolean; // Whether the notification has been delivered to the user
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  from: {
    userId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
  },
  to: {
    type: String,
    required: true,
    index: true, // Index for faster queries by recipient
  },
  type: {
    type: String,
    enum: ['gig-invitation', 'gig-confirmation-required', 'booking-request', 'status-update', 'message', 'system'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: {
    type: Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
  delivered: {
    type: Boolean,
    default: false,
    index: true, // Index for faster queries by delivery status
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
notificationSchema.index({ to: 1, delivered: 1 }); // For finding undelivered notifications for a user
notificationSchema.index({ timestamp: -1 }); // For sorting by newest first
notificationSchema.index({ type: 1 }); // For filtering by notification type

export default mongoose.model<INotification>('Notification', notificationSchema);
