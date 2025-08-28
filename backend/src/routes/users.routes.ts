import { Router, Request, Response } from 'express';
import User from '../models/User.js';
import { ApiResponse } from '../shared/types.js';
import { 
  authenticateToken, 
  requireRole, 
  requireResourceOwnership,
  requireAdmin 
} from '../middleware/auth.middleware.js';

const router = Router();

// Get all users (with pagination and filtering) - PROTECTED ROUTE (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build filter object
    const filter: any = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    const response: ApiResponse<any[]> = {
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Get users error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get users by role - this must come before the :id route - PROTECTED ROUTE (Admin only)
router.get('/by-role/:role', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find({ role })
      .select('-password')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({ role });

    const response: ApiResponse<any[]> = {
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Get users by role error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get user by ID - PROTECTED ROUTE (Owner or Admin only)
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role;

    // Check if user is admin or accessing their own profile
    if (currentUserRole !== 'admin' && currentUserId !== id) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Access denied - you can only view your own profile',
      };
      return res.status(403).json(response);
    }

    const user = await User.findById(id).select('-password');

    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: user,
    };

    res.json(response);
  } catch (error) {
    console.error('Get user error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Update user by ID - PROTECTED ROUTE (Owner or Admin only)
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role;
    const { firstName, lastName, phone, profileImage, isVerified } = req.body;

    // Check if user is admin or updating their own profile
    if (currentUserRole !== 'admin' && currentUserId !== id) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Access denied - you can only update your own profile',
      };
      return res.status(403).json(response);
    }

    // Only admins can update verification status
    const updateData: any = { firstName, lastName, phone, profileImage };
    if (currentUserRole === 'admin' && isVerified !== undefined) {
      updateData.isVerified = isVerified;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: user,
      message: 'User updated successfully',
    };

    res.json(response);
  } catch (error) {
    console.error('Update user error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Delete user by ID - PROTECTED ROUTE (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user!.userId;

    // Prevent users from deleting themselves
    if (currentUserId === id) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'You cannot delete your own account',
      };
      return res.status(400).json(response);
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<null> = {
      success: true,
      message: 'User deleted successfully',
    };

    res.json(response);
  } catch (error) {
    console.error('Delete user error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

export default router;
