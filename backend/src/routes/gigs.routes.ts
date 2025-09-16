import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Gig from '../models/Gig.js';
import User from '../models/User.js';
import { ApiResponse } from '../shared/types.js';
import { socketService } from '../services/socketService.js';
import { 
  authenticateToken, 
  requireGigCreationPermission,
  requireGigModificationPermission
} from '../middleware/auth.middleware.js';

const router = Router();

// Create new gig - PROTECTED ROUTE (Location owners, authorized promoters, and Admins only)
router.post('/', authenticateToken, requireGigCreationPermission, async (req: Request, res: Response) => {
  try {
    // Provide default values for required fields if not provided
    const defaultBonusTiers = {
      tier1: { amount: 0, threshold: 25, color: "bg-yellow-500" },
      tier2: { amount: 0, threshold: 50, color: "bg-green-500" },
      tier3: { amount: 0, threshold: 75, color: "bg-blue-500" }
    };

    // Generate unique gigId
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    const gigId = `GIG-${timestamp}-${randomString}`;

    // Convert string IDs to ObjectIds for MongoDB references
    const gigData = {
      ...req.body,
      gigId: gigId,
      createdBy: req.user!.userId,
      selectedLocation: req.body.selectedLocation ? new mongoose.Types.ObjectId(req.body.selectedLocation) : undefined,
      selectedPromoter: req.body.selectedPromoter ? new mongoose.Types.ObjectId(req.body.selectedPromoter) : undefined,
      // Only convert selectedDoorPerson to ObjectId if it's a valid MongoDB ObjectId (not "self" or empty)
      selectedDoorPerson: req.body.selectedDoorPerson && 
                         req.body.selectedDoorPerson !== "self" && 
                         req.body.selectedDoorPerson !== "" && 
                         mongoose.Types.ObjectId.isValid(req.body.selectedDoorPerson) ? 
                         new mongoose.Types.ObjectId(req.body.selectedDoorPerson) : undefined,
      // Provide default values for required fields
      doorPersonEmail: req.body.doorPersonEmail || "self@venu.com",
      bonusTiers: req.body.bonusTiers || defaultBonusTiers,
      // Set status to pending-confirmation if bands are included
      status: req.body.bands && req.body.bands.length > 0 ? 'pending-confirmation' : 'draft'
    };
    
    const gig = new Gig(gigData);
    await gig.save();

    // 1. Send notification to gig creator
    try {
      await socketService.sendNotificationToUser(req.user!.userId, {
        type: 'gig-created',
        title: 'Gig Created Successfully',
        message: `Your gig "${gig.eventName}" has been created and is awaiting band confirmation.`,
        data: { 
          gigId: gig._id, 
          gigData: gig,
          status: gig.status,
          actionUrl: `/dashboard/gig/${gig._id}`,
          awaitingConfirmation: gig.bands && gig.bands.length > 0
        }
      });
      console.log(`🎵 Gig created notification sent to creator: ${req.user!.userId}`);
    } catch (creatorError) {
      console.error('❌ Error sending gig creation notification to creator:', creatorError);
    }

    // 2. Send push notifications to artists if their emails are included in bands
    if (gig.bands && gig.bands.length > 0) {
      console.log(`🔍 DEBUG: Gig has ${gig.bands.length} bands, attempting to send notifications`);
      console.log(`🔍 DEBUG: Gig bands:`, gig.bands.map(b => ({ name: b.name, email: b.email })));
      try {
        // Get unique email addresses from bands
        const bandEmails = [...new Set(gig.bands.map(band => band.email.toLowerCase()))];
        
        // Find users by email addresses
        const users = await User.find({ 
          email: { $in: bandEmails },
          role: 'artist' 
        }).select('_id email firstName lastName');
        
        console.log(`🔍 DEBUG: Looking for artists with emails:`, bandEmails);
        console.log(`🔍 DEBUG: Found ${users.length} artist users:`, users.map(u => ({ id: u._id, email: u.email, role: u.role })));
        console.log(`🔍 DEBUG: Gig details:`, { gigId: gig._id, eventName: gig.eventName, status: gig.status });
        console.log(`🔍 DEBUG: About to send notifications to ${users.length} users`);
        
        // Send push notifications to found artists (works for both online and offline users)
        for (const user of users) {
          await socketService.sendNotificationToUser((user as any)._id.toString(), {
            type: 'gig-confirmation-required',
            title: 'New Gig Invitation',
            message: `You've been invited to perform at ${gig.eventName} on ${new Date(gig.eventDate).toLocaleDateString()}. Please confirm your participation.`,
            data: { 
              gigId: gig._id, 
              gigData: gig,
              confirmationRequired: true,
              actionUrl: `/artist/confirm-gig/${gig._id}`,
              status: 'pending-confirmation'
            }
          });
        }
        console.log(`🎵 Sent gig invitation notifications to ${users.length} artists for gig ${gig._id}`);
        
        console.log(`📧 Found ${users.length} artists to notify for gig confirmation ${gig._id}`);
      } catch (notificationError: any) {
        console.error('❌ ERROR: Error sending artist confirmation notifications:', notificationError);
        console.error('❌ ERROR: Notification error details:', {
          error: notificationError?.message,
          stack: notificationError?.stack,
          gigId: gig._id,
          bands: gig.bands
        });
        // Don't fail the gig creation if notifications fail
      }
    }

    // Send gig update to location room for real-time updates
    if (gig.selectedLocation) {
      try {
        socketService.sendGigUpdateToLocation(gig.selectedLocation.toString(), {
          gigId: gig.gigId,
          updateType: 'created',
          gigData: gig,
          updatedBy: {
            userId: req.user!.userId,
            email: req.user!.email,
            role: req.user!.role
          }
        });
        console.log(`📅 Sent gig update to location ${gig.selectedLocation} for gig ${gig._id}`);
      } catch (updateError) {
        console.error('Error sending gig update to location:', updateError);
        // Don't fail the gig creation if update fails
      }
    }

    const response: ApiResponse<any> = {
      success: true,
      data: gig,
      message: 'Gig created successfully',
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('=== GIG CREATION ERROR ===');
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error object:', error);
    
    // Provide more specific error messages based on error type
    let errorMessage = 'Internal server error';
    
    if (error?.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + error.message;
    } else if (error?.name === 'CastError') {
      errorMessage = 'Invalid data format: ' + error.message;
    } else if (error?.name === 'BSONError') {
      errorMessage = 'Invalid ID format: ' + error.message;
    } else if (error?.name === 'MongoError' && error?.code === 11000) {
      errorMessage = 'Duplicate entry found';
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
    };
    res.status(500).json(response);
  }
});

// Get all gigs (with pagination and filtering) - PUBLIC ROUTE
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, genre, location, promoter } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build filter object
    const filter: any = {};
    if (status) filter.status = status;
    if (genre) filter.eventGenre = genre;
    if (location) filter.selectedLocation = location;
    if (promoter) filter.selectedPromoter = promoter;

    // Execute queries in parallel for better performance
    const [gigs, total] = await Promise.all([
      Gig.find(filter)
        .populate('selectedLocation', 'name city state')
        .populate('selectedPromoter', 'firstName lastName email')
        .populate('selectedDoorPerson', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .skip(skip)
        .limit(Number(limit))
        .sort({ eventDate: 1 })
        .lean() // Use lean() for better performance
        .exec(), // Explicit exec() for better performance
      Gig.countDocuments(filter).exec()
    ]);

    const response: ApiResponse<any[]> = {
      success: true,
      data: gigs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Get gigs error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get gigs by status - this must come before the :id route - PUBLIC ROUTE
router.get('/by-status/:status', async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const gigs = await Gig.find({ status })
      .populate('selectedLocation', 'name city state')
      .populate('selectedPromoter', 'firstName lastName email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ eventDate: 1 });

    const total = await Gig.countDocuments({ status });

    const response: ApiResponse<any[]> = {
      success: true,
      data: gigs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Get gigs by status error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get gigs by creator - this must come before the :id route - PROTECTED ROUTE
router.get('/by-creator/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const gigs = await Gig.find({ createdBy: userId })
      .populate('selectedLocation', 'name city state')
      .populate('selectedPromoter', 'firstName lastName email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ eventDate: 1 });

    const total = await Gig.countDocuments({ createdBy: userId });

    const response: ApiResponse<any[]> = {
      success: true,
      data: gigs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Get gigs by creator error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Band confirmation endpoint (optimized)
router.post('/:id/confirm-band', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { bandEmail, confirmed } = req.body;
    const userId = req.user!.userId;

    // Find the gig with optimized query
    const gig = await Gig.findById(id).select('bands status eventName selectedLocation');
    if (!gig) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Gig not found',
      };
      return res.status(404).json(response);
    }

    // Find the band by email (case-insensitive)
    const bandIndex = gig.bands.findIndex(band => 
      band.email.toLowerCase() === bandEmail.toLowerCase()
    );
    if (bandIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Band not found in this gig',
      };
      return res.status(404).json(response);
    }

    // Update the band's confirmation status
    gig.bands[bandIndex].confirmed = confirmed;
    
    // Check if lineup is full (confirmed bands >= numberOfBands required)
    const confirmedBandsCount = gig.bands.filter(band => band.confirmed).length;
    const lineupIsFull = confirmedBandsCount >= gig.numberOfBands;
    
    // Determine new status
    let newStatus = gig.status;
    if (lineupIsFull && gig.status === 'pending-confirmation') {
      newStatus = 'posted';
    }

    // Use updateOne for better performance instead of save()
    const updateData: any = { 
      'bands': gig.bands
    };
    
    // Only update status if it changed
    if (newStatus !== gig.status) {
      updateData.status = newStatus;
    }

    await Gig.updateOne(
      { _id: id },
      { $set: updateData }
    );

    // Store the old status for comparison
    const oldStatus = gig.status;

    // Update the local gig object to reflect the changes
    gig.status = newStatus as 'draft' | 'pending-confirmation' | 'posted' | 'live' | 'completed';

    // Send targeted notifications based on status change
    await sendTargetedGigNotifications(gig, newStatus, confirmed, bandEmail, userId, req.user!.email, req.user!.role, oldStatus);

    const response: ApiResponse<any> = {
      success: true,
      data: gig,
      message: confirmed ? 'Band confirmed successfully' : 'Band confirmation removed'
    };

    res.json(response);
  } catch (error) {
    console.error('Band confirmation error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get gig by ID - PUBLIC ROUTE
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const gig = await Gig.findById(id)
      .populate('selectedLocation', 'name city state address')
      .populate('selectedPromoter', 'firstName lastName email phone')
      .populate('selectedDoorPerson', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName email');

    if (!gig) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Gig not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: gig,
    };

    res.json(response);
  } catch (error) {
    console.error('Get gig error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Update gig by ID - PROTECTED ROUTE (Gig creator, location owner, authorized promoter, or Admin only)
router.put('/:id', authenticateToken, requireGigModificationPermission, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const gig = await Gig.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('selectedLocation selectedPromoter selectedDoorPerson createdBy');

    if (!gig) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Gig not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: gig,
      message: 'Gig updated successfully',
    };

    res.json(response);
  } catch (error) {
    console.error('Update gig error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Delete gig by ID - PROTECTED ROUTE (Gig creator, location owner, authorized promoter, or Admin only)
router.delete('/:id', authenticateToken, requireGigModificationPermission, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const gig = await Gig.findByIdAndDelete(id);

    if (!gig) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Gig not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<null> = {
      success: true,
      message: 'Gig deleted successfully',
    };

    res.json(response);
  } catch (error) {
    console.error('Delete gig error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get gigs by artist email - PUBLIC ROUTE
router.get('/by-artist/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Find gigs where the artist's email is in the bands array
    const gigs = await Gig.find({
      'bands.email': { $regex: email, $options: 'i' }
    })
      .populate('selectedLocation', 'name city state address')
      .populate('selectedPromoter', 'firstName lastName email')
      .populate('selectedDoorPerson', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ eventDate: 1 });

    const total = await Gig.countDocuments({
      'bands.email': { $regex: email, $options: 'i' }
    });

    // Transform the data to include artist-specific information
    const transformedGigs = gigs.map(gig => {
      const artistBand = gig.bands.find(band => 
        band.email.toLowerCase() === email.toLowerCase()
      );
      
      return {
        ...gig.toObject(),
        artistBand,
        artistStatus: artistBand?.confirmed ? 'confirmed' : 'pending',
        artistSetTime: artistBand?.setTime,
        artistPercentage: artistBand?.percentage,
        artistGuarantee: 0 // Band guarantee not available in current schema
      };
    });

    const response: ApiResponse<any[]> = {
      success: true,
      data: transformedGigs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Get gigs by artist email error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Helper function for sending targeted gig status update notifications
async function sendTargetedGigNotifications(
  gig: any, 
  newStatus: string, 
  confirmed: boolean, 
  bandEmail: string, 
  userId: string,
  userEmail: string,
  userRole: string,
  oldStatus?: string
): Promise<void> {
  try {
    if (newStatus === 'posted' && oldStatus === 'pending-confirmation') {
      // Gig is now posted - notify creator and location/promoter
      console.log(`🎉 Gig ${gig._id} is now posted! Sending notifications to creator and location/promoter.`);
      
      // Notify gig creator
      await socketService.sendNotificationToUser(gig.createdBy.toString(), {
        type: 'gig-status-update',
        title: 'Gig Posted Successfully',
        message: `Lineup is full! "${gig.eventName}" is now live on the calendar.`,
        data: {
          gigId: gig._id,
          gigData: gig,
          status: 'posted',
          actionUrl: `/dashboard/gig/${gig._id}`,
          calendarUrl: `/calendar/event/${gig._id}`
        }
      });

      // Notify location/promoter
      if (gig.selectedLocation) {
        socketService.sendGigUpdateToLocation(gig.selectedLocation.toString(), {
          gigId: gig.gigId,
          updateType: 'status-changed',
        gigData: gig,
          updatedBy: {
            userId: userId,
            email: userEmail,
            role: userRole
          }
        });
      }
    } else {
      // Individual band confirmation - only notify creator and location/promoter
      console.log(`🔔 Artist ${bandEmail} ${confirmed ? 'confirmed' : 'unconfirmed'} for gig ${gig._id}`);
      
      // Notify gig creator
      await socketService.sendNotificationToUser(gig.createdBy.toString(), {
        type: 'gig-status-update',
        title: 'Artist Confirmation Updated',
        message: `An artist ${confirmed ? 'confirmed' : 'unconfirmed'} participation in "${gig.eventName}".`,
        data: {
          gigId: gig._id,
          gigData: gig,
          bandEmail: bandEmail,
          confirmed: confirmed,
          actionUrl: `/dashboard/gig/${gig._id}`
        }
      });

      // Notify location/promoter
      if (gig.selectedLocation) {
        socketService.sendGigUpdateToLocation(gig.selectedLocation.toString(), {
          gigId: gig.gigId,
          updateType: 'status-changed',
          gigData: gig,
          updatedBy: {
            userId: userId,
            email: userEmail,
            role: userRole
          }
        });
      }
    }
  } catch (error: any) {
    console.error(`❌ Error sending targeted gig notifications for gig ${gig._id}:`, error.message);
  }
}

// Helper function for updating gig status with comprehensive notifications
async function updateGigStatus(
  gigId: string, 
  newStatus: string, 
  updatedBy: string
): Promise<void> {
  try {
    const gig = await Gig.findById(gigId) as any;
    if (!gig) {
      console.error(`❌ Gig not found: ${gigId}`);
      return;
    }

    const oldStatus = gig.status;
    (gig as any).status = newStatus;
    await gig.save();

    // Get all stakeholders
    const stakeholders: string[] = [];
    
    // Add gig creator
    if (gig.createdBy) {
      stakeholders.push(gig.createdBy.toString());
    }

    // Add all confirmed artists
    for (const band of gig.bands) {
      if (band.confirmed) {
        const user = await User.findOne({ email: band.email.toLowerCase() });
        if (user) {
          stakeholders.push((user as any)._id.toString());
        }
      }
    }

    // Remove duplicates
    const uniqueStakeholders = [...new Set(stakeholders)];

    // Send status update notifications
    for (const stakeholderId of uniqueStakeholders) {
      await socketService.sendNotificationToUser(stakeholderId, {
        type: 'gig-status-update',
        title: 'Gig Status Updated',
        message: `"${gig.eventName}" status changed from ${oldStatus} to ${newStatus}`,
        data: {
          gigId: gig._id,
          gigData: gig,
          oldStatus,
          newStatus,
          updatedBy,
          actionUrl: `/dashboard/gig/${gig._id}`,
          statusChange: true
        }
      });
    }

    console.log(`📊 Gig status updated from ${oldStatus} to ${newStatus} for gig ${gigId}`);
  } catch (error: any) {
    console.error(`❌ Error updating gig status for gig ${gigId}:`, error.message);
  }
}

// Helper function for confirming artist participation with status progression
async function confirmArtistParticipation(
  gigId: string, 
  artistEmail: string
): Promise<void> {
  try {
    const gig = await Gig.findById(gigId);
    if (!gig) {
      console.error(`❌ Gig not found: ${gigId}`);
      return;
    }

    // Update band confirmation status
    const bandIndex = gig.bands.findIndex(band => band.email.toLowerCase() === artistEmail.toLowerCase());
    if (bandIndex !== -1) {
      const oldStatus = gig.status;
      gig.bands[bandIndex].confirmed = true;
      
      // Check if lineup is full (confirmed bands >= numberOfBands required)
      const confirmedBandsCount = gig.bands.filter(band => band.confirmed).length;
      const lineupIsFull = confirmedBandsCount >= gig.numberOfBands;
      
      let newStatus = gig.status;
      if (lineupIsFull && gig.status === 'pending-confirmation') {
        newStatus = 'posted';
      }
      
      gig.status = newStatus as 'draft' | 'pending-confirmation' | 'posted' | 'live' | 'completed';
      await gig.save();
      
      // Send targeted notifications
      await sendTargetedGigNotifications(gig, newStatus, true, artistEmail, '', '', '', oldStatus);
      
      console.log(`🎉 Artist ${artistEmail} confirmed for gig ${gigId}. Status: ${oldStatus} → ${newStatus}`);
    }
  } catch (error: any) {
    console.error(`❌ Error confirming artist participation for gig ${gigId}:`, error.message);
  }
}

export default router;
