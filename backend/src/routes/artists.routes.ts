import { Router, Request, Response } from 'express';
import { Artist } from '../models/Artist.js';
import User from '../models/User.js';
import { ApiResponse } from '../shared/types.js';
import { 
  authenticateToken, 
  requireRole, 
  requireResourceOwnership,
  requireAdmin 
} from '../middleware/auth.middleware.js';

const router = Router();

// Get all artists (with pagination and filtering) - PUBLIC ROUTE
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, genre, location, search, sortBy = 'rating', sortOrder = 'desc' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Validate and sanitize inputs
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit))); // Cap at 100 for performance

    // Build filter object with optimized queries
    const filter: any = { isActive: true };
    
    if (genre) {
      filter.genre = { $in: Array.isArray(genre) ? genre : [genre] };
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (search) {
      // Use text search if available, otherwise fallback to regex
      const searchRegex = new RegExp(search as string, 'i');
      filter.$or = [
        { name: searchRegex },
        { bio: searchRegex },
        { genre: { $in: [searchRegex] } },
      ];
    }

    // Build sort object with compound indexes in mind
    const sort: any = {};
    if (sortBy === 'rating') {
      sort.rating = sortOrder === 'desc' ? -1 : 1;
      sort.totalGigs = -1; // Secondary sort for consistency
    } else if (sortBy === 'name') {
      sort.name = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'totalGigs') {
      sort.totalGigs = sortOrder === 'desc' ? -1 : 1;
      sort.rating = -1; // Secondary sort for consistency
    } else {
      sort.createdAt = -1; // Default sort by newest
    }

    // Execute queries in parallel for better performance
    const [artists, total] = await Promise.all([
      Artist.find(filter)
        .populate('userId', 'firstName lastName email isVerified')
        .skip(skip)
        .limit(limitNum)
        .sort(sort)
        .lean(), // Use lean() for better performance when not modifying documents
      Artist.countDocuments(filter)
    ]);

    const response: ApiResponse<any[]> = {
      success: true,
      data: artists,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Get artists error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get artists by genre - PUBLIC ROUTE
router.get('/by-genre/:genre', async (req: Request, res: Response) => {
  try {
    const { genre } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const artists = await Artist.find({ 
      genre: { $in: [genre] },
      isActive: true 
    })
      .populate('userId', 'firstName lastName email isVerified')
      .skip(skip)
      .limit(Number(limit))
      .sort({ rating: -1, totalGigs: -1 });

    const total = await Artist.countDocuments({ 
      genre: { $in: [genre] },
      isActive: true 
    });

    const response: ApiResponse<any[]> = {
      success: true,
      data: artists,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Get artists by genre error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get artists by location - PUBLIC ROUTE
router.get('/by-location/:location', async (req: Request, res: Response) => {
  try {
    const { location } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const artists = await Artist.find({ 
      location: { $regex: location, $options: 'i' },
      isActive: true 
    })
      .populate('userId', 'firstName lastName email isVerified')
      .skip(skip)
      .limit(Number(limit))
      .sort({ rating: -1, totalGigs: -1 });

    const total = await Artist.countDocuments({ 
      location: { $regex: location, $options: 'i' },
      isActive: true 
    });

    const response: ApiResponse<any[]> = {
      success: true,
      data: artists,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Get artists by location error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get artist by ID - PUBLIC ROUTE
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const artist = await Artist.findById(id)
      .populate('userId', 'firstName lastName email isVerified');

    if (!artist) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Artist not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: artist,
    };

    res.json(response);
  } catch (error) {
    console.error('Get artist error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get artist by user ID - PROTECTED ROUTE (Owner or Admin only)
router.get('/user/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role;

    // Check if user is admin or accessing their own profile
    if (currentUserRole !== 'admin' && currentUserId !== userId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Access denied - you can only view your own artist profile',
      };
      return res.status(403).json(response);
    }

    const artist = await Artist.findOne({ userId })
      .populate('userId', 'firstName lastName email isVerified');

    if (!artist) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Artist profile not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: artist,
    };

    res.json(response);
  } catch (error) {
    console.error('Get artist by user ID error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Create artist profile - PROTECTED ROUTE (Authenticated users only)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const {
      name,
      bio,
      genre,
      profileImage,
      email,
      phone,
      instagram,
      spotify,
      appleMusic,
      website,
      youtube,
      tiktok,
      followers,
      location,
      availability,
      priceRange,
      setLength,
      equipmentNeeds,
      pricing,
      typicalSetlist,
      soundRequirements,
      pastPerformances,
      reviews,
      rating,
      portfolioImages,
      portfolioVideos,
      unavailableDates,
      preferredBookingDays,
      bookingLeadTime,
      cancellationPolicy,
    } = req.body;

    // Check if artist profile already exists for this user
    const existingArtist = await Artist.findOne({ userId });
    if (existingArtist) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Artist profile already exists for this user',
      };
      return res.status(400).json(response);
    }

    // Verify user exists and has artist role
    const user = await User.findById(userId);
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      return res.status(404).json(response);
    }

    if (user.role !== 'artist') {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Only users with artist role can create artist profiles',
      };
      return res.status(403).json(response);
    }

    // Create new artist profile
    const artist = new Artist({
      name,
      bio,
      genre,
      profileImage: profileImage || '/images/BandFallBack.PNG',
      email: email || user.email,
      phone,
      instagram,
      spotify,
      appleMusic,
      website,
      youtube,
      tiktok,
      followers: followers || '0',
      location,
      availability,
      priceRange,
      setLength,
      equipmentNeeds,
      pricing,
      typicalSetlist,
      soundRequirements,
      pastPerformances,
      reviews,
      rating: rating || 0,
      portfolioImages: portfolioImages || [],
      portfolioVideos: portfolioVideos || [],
      unavailableDates: unavailableDates || [],
      preferredBookingDays: preferredBookingDays || [],
      bookingLeadTime,
      cancellationPolicy,
      userId,
    });

    await artist.save();

    // Populate the user data
    await artist.populate('userId', 'firstName lastName email isVerified');

    const response: ApiResponse<any> = {
      success: true,
      data: artist,
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating artist profile:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Update artist profile - PROTECTED ROUTE (Owner or Admin only)
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role;
    const {
      name,
      bio,
      genre,
      profileImage,
      email,
      phone,
      instagram,
      spotify,
      appleMusic,
      website,
      youtube,
      tiktok,
      followers,
      location,
      availability,
      priceRange,
      setLength,
      equipmentNeeds,
      pricing,
      pastPerformances,
      reviews,
      rating,
      isActive,
      isVerified,
    } = req.body;

    // Find the artist
    const artist = await Artist.findById(id);
    if (!artist) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Artist not found',
      };
      return res.status(404).json(response);
    }

    // Check if user is admin or updating their own profile
    if (currentUserRole !== 'admin' && artist.userId.toString() !== currentUserId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Access denied - you can only update your own artist profile',
      };
      return res.status(403).json(response);
    }

    // Only admins can update verification status and active status
    const updateData: any = {
      name,
      bio,
      genre,
      profileImage,
      email,
      phone,
      instagram,
      spotify,
      appleMusic,
      website,
      youtube,
      tiktok,
      followers,
      location,
      availability,
      priceRange,
      setLength,
      equipmentNeeds,
      pricing,
      pastPerformances,
      reviews,
      rating,
    };

    if (currentUserRole === 'admin') {
      if (isVerified !== undefined) updateData.isVerified = isVerified;
      if (isActive !== undefined) updateData.isActive = isActive;
    }

    const updatedArtist = await Artist.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email isVerified');

    const response: ApiResponse<any> = {
      success: true,
      data: updatedArtist,
      message: 'Artist profile updated successfully',
    };

    res.json(response);
  } catch (error) {
    console.error('Update artist error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Update artist metrics (rating, followers, totalGigs, totalEarnings) - PROTECTED ROUTE (Admin only)
router.put('/:id/metrics', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, followers, totalGigs, totalEarnings } = req.body;

    const artist = await Artist.findByIdAndUpdate(
      id,
      { rating, followers, totalGigs, totalEarnings },
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email isVerified');

    if (!artist) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Artist not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: artist,
      message: 'Artist metrics updated successfully',
    };

    res.json(response);
  } catch (error) {
    console.error('Update artist metrics error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Delete artist profile - PROTECTED ROUTE (Owner or Admin only)
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role;

    // Find the artist
    const artist = await Artist.findById(id);
    if (!artist) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Artist not found',
      };
      return res.status(404).json(response);
    }

    // Check if user is admin or deleting their own profile
    if (currentUserRole !== 'admin' && artist.userId.toString() !== currentUserId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Access denied - you can only delete your own artist profile',
      };
      return res.status(403).json(response);
    }

    await Artist.findByIdAndDelete(id);

    const response: ApiResponse<null> = {
      success: true,
      message: 'Artist profile deleted successfully',
    };

    res.json(response);
  } catch (error) {
    console.error('Delete artist error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Search artists - PUBLIC ROUTE
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const searchRegex = new RegExp(query, 'i');
    const artists = await Artist.find({
      isActive: true,
      $or: [
        { name: searchRegex },
        { bio: searchRegex },
        { genre: { $in: [searchRegex] } },
        { location: searchRegex },
      ],
    })
      .populate('userId', 'firstName lastName email isVerified')
      .skip(skip)
      .limit(Number(limit))
      .sort({ rating: -1, totalGigs: -1 });

    const total = await Artist.countDocuments({
      isActive: true,
      $or: [
        { name: searchRegex },
        { bio: searchRegex },
        { genre: { $in: [searchRegex] } },
        { location: searchRegex },
      ],
    });

    const response: ApiResponse<any[]> = {
      success: true,
      data: artists,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Search artists error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

export default router;
