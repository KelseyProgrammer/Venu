#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

async function deleteAllUsers() {
  try {
    // Import the User model dynamically
    const UserModule = await import('./dist/models/User.js');
    const User = UserModule.default;

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/venu';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully');

    // Get current user count
    const userCount = await User.countDocuments();
    console.log(`Current user count: ${userCount}`);

    if (userCount === 0) {
      console.log('No users found to delete');
      return;
    }

    // Ask for confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise((resolve) => {
      rl.question(`Are you sure you want to delete ALL ${userCount} users? This action cannot be undone. Type 'YES' to confirm: `, resolve);
    });

    rl.close();

    if (answer !== 'YES') {
      console.log('Operation cancelled');
      return;
    }

    // Delete all users
    console.log('Deleting all users...');
    const result = await User.deleteMany({});
    
    console.log(`Successfully deleted ${result.deletedCount} users`);

  } catch (error) {
    console.error('Error deleting users:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
deleteAllUsers();
