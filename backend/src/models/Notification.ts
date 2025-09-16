import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  id: string;
  from: {
    userId: string;
    email: string;
    role: string;
  };
  to: string; // User ID
  type: 'gig-invitation' | 'gig-confirmation-required' | 'gig-created' | 'gig-status-update' | 'booking-request' | 'status-update' | 'message' | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
  read: boolean;
  delivered: boolean; // Whether the notification was successfully delivered
  deliveryMethod: 'real-time' | 'push' | 'both' | 'failed';
  fcmMessageId?: string; // Firebase message ID for push notifications
  errorMessage?: string; // Error message if delivery failed
  retryCount: number; // Number of retry attempts
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
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
    index: true,
  },
  type: {
    type: String,
    enum: ['gig-invitation', 'gig-confirmation-required', 'gig-created', 'gig-status-update', 'booking-request', 'status-update', 'message', 'system'],
    required: true,
    index: true,
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
    type: String,
    required: true,
    index: true,
  },
  read: {
    type: Boolean,
    default: false,
    index: true,
  },
  delivered: {
    type: Boolean,
    default: false,
    index: true,
  },
  deliveryMethod: {
    type: String,
    enum: ['real-time', 'push', 'both', 'failed'],
    default: 'failed',
    index: true,
  },
  fcmMessageId: {
    type: String,
    sparse: true,
  },
  errorMessage: {
    type: String,
  },
  retryCount: {
    type: Number,
    default: 0,
    min: 0,
    max: 3, // Maximum retry attempts
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
notificationSchema.index({ to: 1, read: 1 });
notificationSchema.index({ to: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ delivered: 1, deliveryMethod: 1 });
notificationSchema.index({ createdAt: -1 }); // For cleanup operations
notificationSchema.index({ fcmMessageId: 1 }, { sparse: true });

// Compound indexes for common queries
notificationSchema.index({ to: 1, type: 1, read: 1 });
notificationSchema.index({ to: 1, delivered: 1, createdAt: -1 });

// TTL index for automatic cleanup of old notifications (90 days)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export default mongoose.model<INotification>('Notification', notificationSchema);
