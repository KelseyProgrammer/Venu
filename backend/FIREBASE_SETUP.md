# Firebase Setup Guide for Push Notifications

## Overview
This guide explains how to set up Firebase Cloud Messaging (FCM) for push notifications in the VENU backend.

## Prerequisites
1. A Google account
2. Access to Firebase Console

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "venu-notifications")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Cloud Messaging

1. In your Firebase project, go to "Project Settings" (gear icon)
2. Navigate to the "Cloud Messaging" tab
3. Note down your "Sender ID" (you'll need this for frontend setup)

## Step 3: Generate Service Account Key

1. In Firebase Console, go to "Project Settings" > "Service Accounts"
2. Click "Generate new private key"
3. Download the JSON file
4. **Keep this file secure** - it contains sensitive credentials

## Step 4: Configure Backend Environment

Add these environment variables to your backend `.env` file:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id_from_json_file
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_FROM_JSON\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### Important Notes:
- Replace the values with those from your downloaded JSON file
- The `FIREBASE_PRIVATE_KEY` should include the full private key with newlines (`\n`)
- Never commit the actual service account JSON file to version control

## Step 5: Test the Setup

1. Start your backend server
2. Check the console for: `✅ Firebase Admin SDK initialized successfully`
3. If you see a warning about missing credentials, double-check your environment variables

## Troubleshooting

### Common Issues:

1. **"Firebase credentials not found"**
   - Verify all three environment variables are set
   - Check that the private key includes proper newline characters

2. **"Invalid private key"**
   - Ensure the private key is properly formatted with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
   - Check that newlines are represented as `\n` in the environment variable

3. **"Project not found"**
   - Verify the `FIREBASE_PROJECT_ID` matches your Firebase project ID

## Security Best Practices

1. **Never commit service account keys to version control**
2. **Use environment variables for all sensitive data**
3. **Rotate service account keys regularly**
4. **Limit service account permissions to only what's needed**

## Next Steps

Once Firebase is configured:
1. The backend will automatically detect and use FCM for offline users
2. Online users will continue to receive real-time Socket.IO notifications
3. The system provides fallback: real-time for online users, push notifications for offline users

## Support

If you encounter issues:
1. Check the backend console for error messages
2. Verify Firebase project settings
3. Test with a simple notification to ensure everything works
