import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Gig from '../models/Gig.js';
import connectDB from '../config/database.js';

dotenv.config();

interface MigrationResult {
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

class NotificationMigration {
  private results: MigrationResult[] = [];

  private addResult(result: MigrationResult) {
    this.results.push(result);
    console.log(`📊 ${result.success ? '✅' : '❌'} ${result.message}`);
    if (result.error) {
      console.error(`   Error: ${result.error}`);
    }
    if (result.details) {
      console.log(`   Details:`, result.details);
    }
  }

  // Ensure fcmToken field exists in User model
  async ensureFcmTokenField(): Promise<MigrationResult> {
    try {
      // Check if fcmToken field exists in User collection
      const sampleUser = await User.findOne({}).lean();
      
      if (sampleUser && !('fcmToken' in sampleUser)) {
        // Add fcmToken field to all users (will be null/undefined initially)
        const updateResult = await User.updateMany(
          {},
          { $set: { fcmToken: null } },
          { strict: false } // Allow fields not in schema
        );

        return {
          success: true,
          message: `Added fcmToken field to User model`,
          details: {
            usersUpdated: updateResult.modifiedCount,
            totalUsers: await User.countDocuments()
          }
        };
      } else {
        return {
          success: true,
          message: `fcmToken field already exists in User model`,
          details: {
            totalUsers: await User.countDocuments()
          }
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to add fcmToken field to User model`,
        error: error.message
      };
    }
  }

  // Ensure status field exists in Gig model with proper values
  async ensureGigStatusField(): Promise<MigrationResult> {
    try {
      const gigsWithoutStatus = await Gig.find({ 
        $or: [
          { status: { $exists: false } },
          { status: null },
          { status: '' }
        ]
      });

      if (gigsWithoutStatus.length > 0) {
        // Update gigs without proper status
        for (const gig of gigsWithoutStatus) {
          let newStatus = 'draft';
          
          // Determine status based on gig data
          if (gig.bands && gig.bands.length > 0) {
            const confirmedBandsCount = gig.bands.filter(band => band.confirmed).length;
            const lineupIsFull = confirmedBandsCount >= gig.numberOfBands;
            newStatus = lineupIsFull ? 'posted' : 'pending-confirmation';
          }

          await Gig.findByIdAndUpdate(gig._id, { status: newStatus });
        }

        return {
          success: true,
          message: `Updated status field for ${gigsWithoutStatus.length} gigs`,
          details: {
            gigsUpdated: gigsWithoutStatus.length,
            totalGigs: await Gig.countDocuments()
          }
        };
      } else {
        return {
          success: true,
          message: `All gigs already have proper status values`,
          details: {
            totalGigs: await Gig.countDocuments()
          }
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to update Gig status field`,
        error: error.message
      };
    }
  }

  // Create indexes for better performance
  async createIndexes(): Promise<MigrationResult> {
    try {
      // User collection indexes
      await User.collection.createIndex({ fcmToken: 1 }, { sparse: true });
      
      // Gig collection indexes (most should already exist)
      await Gig.collection.createIndex({ status: 1, eventDate: 1 });
      await Gig.collection.createIndex({ createdBy: 1, status: 1 });
      await Gig.collection.createIndex({ 'bands.email': 1, status: 1 });

      return {
        success: true,
        message: `Created performance indexes`,
        details: {
          userIndexes: ['fcmToken (sparse)'],
          gigIndexes: ['status + eventDate', 'createdBy + status', 'bands.email + status']
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to create indexes`,
        error: error.message
      };
    }
  }

  // Validate data integrity
  async validateDataIntegrity(): Promise<MigrationResult> {
    try {
      const issues: string[] = [];
      
      // Check for users without required fields
      const usersWithoutEmail = await User.countDocuments({ email: { $exists: false } });
      if (usersWithoutEmail > 0) {
        issues.push(`${usersWithoutEmail} users missing email field`);
      }

      // Check for gigs without proper band confirmation status
      const gigsWithInconsistentStatus = await Gig.aggregate([
        {
          $match: {
            status: 'posted',
            'bands.confirmed': false
          }
        },
        {
          $count: 'count'
        }
      ]);

      if (gigsWithInconsistentStatus.length > 0 && gigsWithInconsistentStatus[0].count > 0) {
        issues.push(`${gigsWithInconsistentStatus[0].count} posted gigs have unconfirmed bands`);
      }

      // Check for orphaned references
      const gigsWithInvalidCreatedBy = await Gig.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'creator'
          }
        },
        {
          $match: {
            creator: { $size: 0 }
          }
        },
        {
          $count: 'count'
        }
      ]);

      if (gigsWithInvalidCreatedBy.length > 0 && gigsWithInvalidCreatedBy[0].count > 0) {
        issues.push(`${gigsWithInvalidCreatedBy[0].count} gigs have invalid createdBy references`);
      }

      return {
        success: issues.length === 0,
        message: issues.length === 0 ? 'Data integrity validation passed' : 'Data integrity issues found',
        details: {
          issues: issues.length > 0 ? issues : 'No issues found',
          totalUsers: await User.countDocuments(),
          totalGigs: await Gig.countDocuments()
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to validate data integrity`,
        error: error.message
      };
    }
  }

  // Main migration function
  async runMigration(): Promise<void> {
    console.log('🚀 Starting Notification System Database Migration...\n');

    try {
      // Connect to database
      await connectDB();
      console.log('✅ Connected to MongoDB\n');

      // Run migration steps
      this.addResult(await this.ensureFcmTokenField());
      this.addResult(await this.ensureGigStatusField());
      this.addResult(await this.createIndexes());
      this.addResult(await this.validateDataIntegrity());

      // Summary
      const successful = this.results.filter(r => r.success).length;
      const failed = this.results.filter(r => !r.success).length;

      console.log('\n📊 Migration Summary:');
      console.log(`✅ Successful: ${successful}`);
      console.log(`❌ Failed: ${failed}`);
      console.log(`📝 Total Steps: ${this.results.length}`);

      if (failed === 0) {
        console.log('\n🎉 Migration completed successfully!');
        console.log('📱 Notification system is ready for Phase 3 implementation.');
      } else {
        console.log('\n⚠️  Migration completed with some issues.');
        console.log('🔧 Please review the failed steps before proceeding.');
      }

    } catch (error: any) {
      console.error('\n❌ Migration failed:', error.message);
      process.exit(1);
    } finally {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed.');
    }
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const migration = new NotificationMigration();
  migration.runMigration().catch(console.error);
}

export default NotificationMigration;
