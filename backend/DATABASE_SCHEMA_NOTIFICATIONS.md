# Database Schema Updates for Notification System

## Overview
This document outlines the database schema changes implemented in Phase 2 to support the comprehensive notification system.

## Schema Changes

### 1. User Model Updates

#### Added Fields
- **`fcmToken`** (String, Optional, Indexed)
  - Firebase Cloud Messaging token for push notifications
  - Sparse index for efficient querying
  - Automatically cleaned up when invalid

#### Schema Definition
```typescript
interface IUser extends Document {
  // ... existing fields ...
  fcmToken?: string; // Firebase Cloud Messaging token for push notifications
  // ... rest of fields ...
}
```

#### Database Indexes
```javascript
// Sparse index for FCM tokens
userSchema.index({ fcmToken: 1 }, { sparse: true });
```

### 2. Gig Model Updates

#### Existing Fields (Already Implemented)
- **`status`** (String, Required, Indexed)
  - Enum: `['draft', 'pending-confirmation', 'posted', 'live', 'completed']`
  - Default: `'draft'`
  - Automatically set based on band confirmation status

#### Status Logic
- **`draft`**: Initial creation without bands (no notifications sent)
- **`pending-confirmation`**: Gig created with bands, awaiting artist confirmations
- **`posted`**: All bands confirmed, gig published to public calendar
- **`live`**: Event is currently happening
- **`completed`**: Event has finished

### 3. New Notification Model

#### Purpose
Track notification delivery, read status, and retry attempts for comprehensive monitoring.

#### Schema Definition
```typescript
interface INotification extends Document {
  id: string; // Unique notification ID
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
  retryCount: number; // Number of retry attempts (max 3)
  createdAt: Date;
  updatedAt: Date;
}
```

#### Database Indexes
```javascript
// Primary indexes
notificationSchema.index({ id: 1 }, { unique: true });
notificationSchema.index({ to: 1, read: 1 });
notificationSchema.index({ to: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ delivered: 1, deliveryMethod: 1 });

// Compound indexes
notificationSchema.index({ to: 1, type: 1, read: 1 });
notificationSchema.index({ to: 1, delivered: 1, createdAt: -1 });

// TTL index for automatic cleanup (90 days)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
```

## Migration Scripts

### 1. Main Migration Script
**File**: `src/scripts/migrate-notifications.ts`

**Features**:
- Adds `fcmToken` field to User model
- Validates and updates Gig status fields
- Creates performance indexes
- Validates data integrity
- Comprehensive error handling and reporting

**Usage**:
```bash
npm run migrate:notifications
```

### 2. FCM Token Management
**File**: `src/scripts/manage-fcm-tokens.ts`

**Features**:
- Token statistics and distribution analysis
- Cleanup of invalid/duplicate tokens
- Individual token management
- Usage reporting

**Usage**:
```bash
# View token statistics
npm run migrate:fcm-tokens

# Cleanup invalid tokens
npm run migrate:fcm-tokens --cleanup

# Update specific user token
npm run migrate:fcm-tokens --update user@example.com <token>

# Remove specific user token
npm run migrate:fcm-tokens --remove user@example.com
```

## Data Integrity Rules

### 1. User Model
- `fcmToken` is optional and can be null
- Duplicate tokens are automatically cleaned up
- Invalid tokens are removed during cleanup operations

### 2. Gig Model
- `status` must be one of the defined enum values
- Posted gigs must have all bands confirmed
- Status transitions are validated during updates

### 3. Notification Model
- `id` must be unique across all notifications
- `retryCount` cannot exceed 3 attempts
- Notifications older than 90 days are automatically deleted
- `deliveryMethod` must be one of the defined values

## Performance Optimizations

### 1. Indexing Strategy
- **Sparse indexes** for optional fields (fcmToken)
- **Compound indexes** for common query patterns
- **TTL indexes** for automatic cleanup
- **Text indexes** for search functionality

### 2. Query Optimization
- Efficient user lookups by email and FCM token
- Fast notification retrieval by user and type
- Optimized gig status filtering and sorting

### 3. Memory Management
- Automatic cleanup of old notifications
- Efficient batch operations for token management
- Minimal memory footprint for real-time operations

## Backward Compatibility

### 1. Existing Data
- All existing users will have `fcmToken` set to null initially
- Existing gigs without status will be assigned appropriate status
- No data loss during migration

### 2. API Compatibility
- All existing API endpoints continue to work
- New notification endpoints are additive
- Graceful fallback when FCM is not configured

### 3. Frontend Compatibility
- Real-time notifications continue to work as before
- Push notifications are optional enhancements
- Progressive enhancement approach

## Monitoring and Maintenance

### 1. Health Checks
- Monitor FCM token coverage percentage
- Track notification delivery success rates
- Validate data integrity regularly

### 2. Cleanup Operations
- Automatic cleanup of old notifications (90 days)
- Manual cleanup of invalid FCM tokens
- Regular index optimization

### 3. Performance Monitoring
- Query performance tracking
- Index usage analysis
- Memory usage monitoring

## Security Considerations

### 1. FCM Token Security
- Tokens are stored securely in database
- Automatic cleanup of invalid tokens
- No token exposure in API responses

### 2. Data Privacy
- Notifications are user-specific
- Automatic cleanup prevents data accumulation
- Secure token management

### 3. Access Control
- Migration scripts require proper authentication
- Token management restricted to authorized users
- Audit logging for sensitive operations

## Troubleshooting

### Common Issues

1. **Migration Failures**
   - Check database connectivity
   - Verify user permissions
   - Review error logs for specific issues

2. **Token Management Issues**
   - Validate FCM token format
   - Check for duplicate tokens
   - Verify user email addresses

3. **Performance Issues**
   - Monitor index usage
   - Check for missing indexes
   - Optimize query patterns

### Recovery Procedures

1. **Failed Migration Recovery**
   - Run migration script again (idempotent)
   - Check partial migration results
   - Manual cleanup if necessary

2. **Data Corruption Recovery**
   - Restore from backup
   - Re-run migration scripts
   - Validate data integrity

3. **Performance Recovery**
   - Rebuild indexes
   - Optimize queries
   - Clean up old data

## Future Enhancements

### 1. Advanced Features
- Notification scheduling
- Bulk notification operations
- Advanced delivery tracking

### 2. Performance Improvements
- Caching strategies
- Batch processing optimization
- Real-time analytics

### 3. Monitoring Enhancements
- Advanced metrics collection
- Alerting systems
- Performance dashboards

---

**Last Updated**: December 2024  
**Phase**: 2 - Database Schema Updates  
**Status**: ✅ Complete and Production Ready
