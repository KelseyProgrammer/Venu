// Debug Second Notification Issue
// Run this in your browser console to test notification sending

console.log('🔍 Debugging Second Notification Issue');

// Test 1: Check if socket manager is working
console.log('Socket manager available:', !!window.socketManager);
console.log('Socket connected:', window.socketManager?.connected);

// Test 2: Send a test notification manually
if (window.socketManager && window.socketManager.connected) {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Current user:', payload);
      
      // Send test notification
      window.socketManager.sendNotification(
        payload.userId,
        'system',
        'Manual Test Notification',
        'Testing if notifications work manually'
      );
      
      console.log('✅ Manual test notification sent');
    } catch (error) {
      console.error('❌ Error sending manual notification:', error);
    }
  }
}

// Test 3: Check if there are any console errors
console.log('Check the backend console for any errors when posting the second gig');
console.log('Look for these log patterns:');
console.log('  - 🔍 DEBUG: Gig has X bands, attempting to send notifications');
console.log('  - 🔍 DEBUG: Found X artist users');
console.log('  - 🎵 Batch sent confirmation notifications to X artists');

// Test 4: Check notification history
console.log('Current notifications in localStorage:');
const notifications = localStorage.getItem('notifications');
if (notifications) {
  console.log('Stored notifications:', JSON.parse(notifications));
} else {
  console.log('No stored notifications found');
}
