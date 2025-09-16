import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/database.js';

dotenv.config();

interface FCMTokenStats {
  totalUsers: number;
  usersWithTokens: number;
  usersWithoutTokens: number;
  tokenDistribution: Record<string, number>;
}

class FCMTokenManager {
  // Get statistics about FCM token distribution
  async getTokenStats(): Promise<FCMTokenStats> {
    const totalUsers = await User.countDocuments();
    const usersWithTokens = await User.countDocuments({ 
      fcmToken: { $exists: true, $ne: null, $nin: [''] } 
    });
    const usersWithoutTokens = totalUsers - usersWithTokens;

    // Get token distribution by role
    const tokenDistribution = await User.aggregate([
      {
        $match: {
          fcmToken: { $exists: true, $ne: null, $nin: [''] }
        }
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const distribution: Record<string, number> = {};
    tokenDistribution.forEach(item => {
      distribution[item._id] = item.count;
    });

    return {
      totalUsers,
      usersWithTokens,
      usersWithoutTokens,
      tokenDistribution: distribution
    };
  }

  // Clean up invalid or duplicate FCM tokens
  async cleanupTokens(): Promise<void> {
    console.log('🧹 Cleaning up FCM tokens...');

    // Remove empty or null tokens
    const emptyTokensResult = await User.updateMany(
      { fcmToken: { $in: [null, '', 'null', 'undefined'] } },
      { $unset: { fcmToken: 1 } }
    );
    console.log(`✅ Removed ${emptyTokensResult.modifiedCount} empty tokens`);

    // Find and handle duplicate tokens
    const duplicateTokens = await User.aggregate([
      {
        $match: {
          fcmToken: { $exists: true, $ne: null, $nin: [''] }
        }
      },
      {
        $group: {
          _id: '$fcmToken',
          count: { $sum: 1 },
          users: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    if (duplicateTokens.length > 0) {
      console.log(`⚠️  Found ${duplicateTokens.length} duplicate FCM tokens`);
      
      for (const duplicate of duplicateTokens) {
        // Keep the token for the most recent user, remove from others
        const usersToUpdate = duplicate.users.slice(1); // Remove first user (most recent)
        
        await User.updateMany(
          { _id: { $in: usersToUpdate } },
          { $unset: { fcmToken: 1 } }
        );
        
        console.log(`   Removed duplicate token from ${usersToUpdate.length} users`);
      }
    }

    console.log('✅ FCM token cleanup completed');
  }

  // Update FCM token for a specific user
  async updateUserToken(userEmail: string, fcmToken: string): Promise<boolean> {
    try {
      const user = await User.findOneAndUpdate(
        { email: userEmail.toLowerCase() },
        { fcmToken: fcmToken },
        { new: true }
      );

      if (user) {
        console.log(`✅ Updated FCM token for user: ${userEmail}`);
        return true;
      } else {
        console.log(`❌ User not found: ${userEmail}`);
        return false;
      }
    } catch (error: any) {
      console.error(`❌ Error updating FCM token for ${userEmail}:`, error.message);
      return false;
    }
  }

  // Remove FCM token for a specific user
  async removeUserToken(userEmail: string): Promise<boolean> {
    try {
      const user = await User.findOneAndUpdate(
        { email: userEmail.toLowerCase() },
        { $unset: { fcmToken: 1 } },
        { new: true }
      );

      if (user) {
        console.log(`✅ Removed FCM token for user: ${userEmail}`);
        return true;
      } else {
        console.log(`❌ User not found: ${userEmail}`);
        return false;
      }
    } catch (error: any) {
      console.error(`❌ Error removing FCM token for ${userEmail}:`, error.message);
      return false;
    }
  }

  // List users with FCM tokens
  async listUsersWithTokens(limit: number = 10): Promise<void> {
    const users = await User.find(
      { fcmToken: { $exists: true, $ne: null, $nin: [''] } },
      { email: 1, firstName: 1, lastName: 1, role: 1, fcmToken: 1 }
    ).limit(limit);

    console.log(`\n📱 Users with FCM tokens (showing ${users.length} of total):`);
    users.forEach(user => {
      const tokenPreview = user.fcmToken?.substring(0, 20) + '...';
      console.log(`   ${user.email} (${user.role}) - ${tokenPreview}`);
    });
  }

  // Main function to display stats and options
  async run(): Promise<void> {
    console.log('🔧 FCM Token Management Utility\n');

    try {
      await connectDB();
      console.log('✅ Connected to MongoDB\n');

      const stats = await this.getTokenStats();
      
      console.log('📊 FCM Token Statistics:');
      console.log(`   Total Users: ${stats.totalUsers}`);
      console.log(`   Users with Tokens: ${stats.usersWithTokens}`);
      console.log(`   Users without Tokens: ${stats.usersWithoutTokens}`);
      console.log(`   Token Coverage: ${((stats.usersWithTokens / stats.totalUsers) * 100).toFixed(1)}%`);
      
      console.log('\n📈 Token Distribution by Role:');
      Object.entries(stats.tokenDistribution).forEach(([role, count]) => {
        console.log(`   ${role}: ${count} tokens`);
      });

      // Show sample users with tokens
      await this.listUsersWithTokens(5);

      // Cleanup option
      const args = process.argv.slice(2);
      if (args.includes('--cleanup')) {
        await this.cleanupTokens();
      }

      if (args.includes('--update') && args.length >= 3) {
        const email = args[args.indexOf('--update') + 1];
        const token = args[args.indexOf('--update') + 2];
        await this.updateUserToken(email, token);
      }

      if (args.includes('--remove') && args.length >= 2) {
        const email = args[args.indexOf('--remove') + 1];
        await this.removeUserToken(email);
      }

      console.log('\n💡 Usage:');
      console.log('   npm run migrate:fcm-tokens --cleanup');
      console.log('   npm run migrate:fcm-tokens --update user@example.com <token>');
      console.log('   npm run migrate:fcm-tokens --remove user@example.com');

    } catch (error: any) {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    } finally {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed.');
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new FCMTokenManager();
  manager.run().catch(console.error);
}

export default FCMTokenManager;
