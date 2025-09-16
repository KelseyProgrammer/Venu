import { Router, Request, Response } from 'express';
import User from '../models/User.js';
import { ApiResponse } from '../shared/types.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Update user's FCM token for push notifications
router.put('/fcm-token', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user!.userId;

    if (!fcmToken || typeof fcmToken !== 'string') {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Valid FCM token is required',
      };
      return res.status(400).json(response);
    }

    // Update user's FCM token
    const user = await User.findByIdAndUpdate(
      userId,
      { fcmToken: fcmToken.trim() },
      { new: true, select: 'email firstName lastName role fcmToken' }
    );

    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      return res.status(404).json(response);
    }

    console.log(`📱 Updated FCM token for user: ${user.email}`);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        fcmTokenUpdated: true,
      },
      message: 'FCM token updated successfully',
    };

    res.json(response);
  } catch (error: any) {
    console.error('Update FCM token error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Remove user's FCM token (logout or disable notifications)
router.delete('/fcm-token', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Remove user's FCM token
    const user = await User.findByIdAndUpdate(
      userId,
      { $unset: { fcmToken: 1 } },
      { new: true, select: 'email firstName lastName role' }
    );

    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      return res.status(404).json(response);
    }

    console.log(`📱 Removed FCM token for user: ${user.email}`);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        fcmTokenRemoved: true,
      },
      message: 'FCM token removed successfully',
    };

    res.json(response);
  } catch (error: any) {
    console.error('Remove FCM token error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get user's stored notifications
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { limit = 50, offset = 0, unreadOnly = false } = req.query;

    // Import Notification model dynamically
    const Notification = (await import('../models/Notification.js')).default;

    // Build query
    const query: any = { to: userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset))
      .lean();

    // Get unread count
    const unreadCount = await Notification.countDocuments({ to: userId, read: false });

    console.log(`📬 Retrieved ${notifications.length} notifications for user ${userId} (${unreadCount} unread)`);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        notifications,
        unreadCount,
        total: notifications.length,
        hasMore: notifications.length === Number(limit)
      },
      message: 'Notifications retrieved successfully',
    };

    res.json(response);
  } catch (error: any) {
    console.error('Get notifications error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user!.userId;

    // Import Notification model dynamically
    const Notification = (await import('../models/Notification.js')).default;

    const notification = await Notification.findOneAndUpdate(
      { id: notificationId, to: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Notification not found',
      };
      return res.status(404).json(response);
    }

    console.log(`✅ Marked notification ${notificationId} as read for user ${userId}`);

    const response: ApiResponse<any> = {
      success: true,
      data: notification,
      message: 'Notification marked as read',
    };

    res.json(response);
  } catch (error: any) {
    console.error('Mark notification as read error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Import Notification model dynamically
    const Notification = (await import('../models/Notification.js')).default;

    const result = await Notification.updateMany(
      { to: userId, read: false },
      { read: true }
    );

    console.log(`✅ Marked ${result.modifiedCount} notifications as read for user ${userId}`);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} notifications marked as read`,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Mark all notifications as read error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get user's notification preferences and FCM token status
router.get('/preferences', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await User.findById(userId).select('email firstName lastName role fcmToken createdAt updatedAt');

    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        hasFcmToken: !!user.fcmToken,
        fcmTokenLastUpdated: user.updatedAt,
        preferences: {
          pushNotifications: !!user.fcmToken,
          realTimeNotifications: true, // Always enabled
        },
      },
      message: 'Notification preferences retrieved successfully',
    };

    res.json(response);
  } catch (error: any) {
    console.error('Get notification preferences error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Test notification endpoint (for development/testing)
router.post('/test', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { targetUserId, title, message, type = 'system' } = req.body;
    const fromUserId = req.user!.userId;

    if (!targetUserId || !title || !message) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'targetUserId, title, and message are required',
      };
      return res.status(400).json(response);
    }

    // Import socketService dynamically to avoid circular dependencies
    const { socketService } = await import('../services/socketService.js');

    await socketService.sendNotificationToUser(targetUserId, {
      type: type as any,
      title,
      message,
      data: {
        testNotification: true,
        sentBy: fromUserId,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`🧪 Test notification sent from ${fromUserId} to ${targetUserId}`);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        sentTo: targetUserId,
        sentBy: fromUserId,
        title,
        message,
        type,
      },
      message: 'Test notification sent successfully',
    };

    res.json(response);
  } catch (error: any) {
    console.error('Send test notification error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get notification statistics (admin only)
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Check if user is admin (you can implement proper admin check)
    if (req.user!.role !== 'admin') {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Admin access required',
      };
      return res.status(403).json(response);
    }

    // Import Notification model dynamically
    const Notification = (await import('../models/Notification.js')).default;

    const stats = await Notification.aggregate([
      {
        $group: {
          _id: null,
          totalNotifications: { $sum: 1 },
          deliveredNotifications: { $sum: { $cond: ['$delivered', 1, 0] } },
          readNotifications: { $sum: { $cond: ['$read', 1, 0] } },
          failedNotifications: { $sum: { $cond: [{ $eq: ['$deliveryMethod', 'failed'] }, 1, 0] } },
        }
      }
    ]);

    const typeStats = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          delivered: { $sum: { $cond: ['$delivered', 1, 0] } },
        }
      },
      { $sort: { count: -1 } }
    ]);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        overview: stats[0] || {
          totalNotifications: 0,
          deliveredNotifications: 0,
          readNotifications: 0,
          failedNotifications: 0,
        },
        typeBreakdown: typeStats,
        timestamp: new Date().toISOString(),
      },
      message: 'Notification statistics retrieved successfully',
    };

    res.json(response);
  } catch (error: any) {
    console.error('Get notification stats error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

export default router;
