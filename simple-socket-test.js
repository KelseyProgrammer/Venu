// Simple Socket Connection Script
// Copy and paste this entire script into your browser console

console.log('🔧 Setting up simple socket connection...');

// Check if we have an auth token
const token = localStorage.getItem('authToken');
if (!token) {
  console.error('❌ No auth token found. Please log in first.');
} else {
  console.log('✅ Auth token found');
  
  // Decode token to get user info
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('👤 User:', {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    });
    
    // Create a simple socket connection
    const socket = io('http://localhost:3001', {
      auth: { token },
      transports: ['polling']
    });
    
    socket.on('connect', () => {
      console.log('✅ Simple socket connected:', socket.id);
      
      // Listen for notifications
      socket.on('notification', (notification) => {
        console.log('🔔 Notification received:', notification);
        
        // Show a simple alert for testing
        alert(`Notification: ${notification.title}\n${notification.message}`);
      });
      
      // Store socket globally for testing
      window.testSocket = socket;
      
      console.log('🎉 Socket is ready! You can now:');
      console.log('1. Send notifications: window.testSocket.emit("send-notification", {...})');
      console.log('2. Listen for notifications: Already set up');
      
      // Send a test notification to yourself
      socket.emit('send-notification', {
        targetUserId: payload.userId,
        type: 'system',
        title: 'Test Notification',
        message: 'This is a test notification from the simple socket connection',
        data: { test: true }
      });
      
      console.log('📤 Test notification sent to:', payload.userId);
    });
    
    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });
    
  } catch (error) {
    console.error('❌ Invalid token format:', error);
  }
}

// Helper function to send notifications
window.sendTestNotification = function(message = 'Test notification from console') {
  if (window.testSocket && window.testSocket.connected) {
    const token = localStorage.getItem('authToken');
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    window.testSocket.emit('send-notification', {
      targetUserId: payload.userId,
      type: 'system',
      title: 'Console Test',
      message: message,
      data: { source: 'console' }
    });
    
    console.log('📤 Test notification sent:', message);
  } else {
    console.error('❌ Socket not connected. Run the setup script first.');
  }
};

console.log('💡 After socket connects, you can use: window.sendTestNotification("Your message")');
