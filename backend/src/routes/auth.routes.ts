import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { ApiResponse } from '../shared/types.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { generateToken, validateJWTConfig } from '../config/jwt.config.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { registerSchema, loginSchema } from '../validation/schemas.js';

const router = Router();

// Register new user
router.post('/register', validateBody(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, role, firstName, lastName, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User with this email already exists',
      };
      return res.status(400).json(response);
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      phone,
    });

    await user.save();

    // Generate JWT token
    let token: string;
    try {
      validateJWTConfig();
      token = generateToken({
        userId: (user._id as any).toString(),
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error('JWT configuration error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Server configuration error',
      };
      return res.status(500).json(response);
    }

    const response: ApiResponse<{ user: any; token: string }> = {
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          isVerified: user.isVerified,
        },
        token,
      },
      message: 'User registered successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Login user
router.post('/login', validateBody(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email (case insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid email or password',
      };
      return res.status(401).json(response);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid email or password',
      };
      return res.status(401).json(response);
    }

    // Generate JWT token
    let token: string;
    try {
      validateJWTConfig();
      token = generateToken({
        userId: (user._id as any).toString(),
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error('JWT configuration error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Server configuration error',
      };
      return res.status(500).json(response);
    }

    const response: ApiResponse<{ user: any; token: string }> = {
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          isVerified: user.isVerified,
        },
        token,
      },
      message: 'Login successful',
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get user profile - PROTECTED ROUTE
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await User.findById(userId).select('-password');
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
    console.error('Profile error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Update user profile - PROTECTED ROUTE
router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { firstName, lastName, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, phone },
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
      message: 'Profile updated successfully',
    };

    res.json(response);
  } catch (error) {
    console.error('Profile update error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

export default router;
