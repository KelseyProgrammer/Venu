// Simplified notification debugger - works in browser console
// Copy and paste this entire code into your browser console

console.log('🔧 VENU Notification System - Simplified Debugger');
console.log('================================================');

// Check if socket.io is already loaded
function checkSocketIO() {
  console.log('\n🔍 Checking for Socket.IO...');
  
  // Check if socket.io is available globally
  if (typeof io !== 'undefined') {
    console.log('✅ Socket.IO client is available globally');
    return true;
  }
  
  // Check if it's available in window
  if (window.io) {
    console.log('✅ Socket.IO client is available in window');
    return true;
  }
  
  // Check if socket manager exists
  if (window.socketManager) {
    console.log('✅ Socket manager exists');
    const socket = window.socketManager.getSocket();
    if (socket) {
      console.log('🔌 Socket ID:', socket.id);
      console.log('🔌 Socket connected:', socket.connected);
      return true;
    }
  }
  
  console.log('❌ Socket.IO client not found');
  return false;
}

// Check authentication
function checkAuth() {
  console.log('\n🔍 Checking Authentication...');
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    console.error('❌ No auth token found');
    return null;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('✅ Auth token valid');
    console.log('👤 User:', {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    });
    return { token, payload };
  } catch (error) {
    console.error('❌ Invalid auth token:', error);
    return null;
  }
}

// Test existing socket connection
function testExistingSocket() {
  console.log('\n🔍 Testing Existing Socket Connection...');
  
  if (!window.socketManager) {
    console.log('❌ No socket manager found');
    return;
  }
  
  const socket = window.socketManager.getSocket();
  if (!socket) {
    console.log('❌ No socket instance found');
    return;
  }
  
  console.log('🔌 Socket details:', {
    id: socket.id,
    connected: socket.connected,
    transport: socket.io.engine.transport.name
  });
  
  // Listen for notifications
  socket.on('notification', (notification) => {
    console.log('🔔 NOTIFICATION RECEIVED:', notification);
  });
  
  console.log('👂 Listening for notifications...');
  
  // Test sending a notification to yourself
  const auth = checkAuth();
  if (auth) {
    socket.emit('send-notification', {
      targetUserId: auth.payload.userId,
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test notification from the debugger',
      data: { debug: true }
    });
    console.log('📤 Test notification sent to:', auth.payload.userId);
  }
}

// Check React components for notification state
function checkReactComponents() {
  console.log('\n🔍 Checking React Components...');
  
  // Look for React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools available');
    
    // Try to find the notification component
    const reactRoot = document.querySelector('#__next') || document.querySelector('#root');
    if (reactRoot) {
      console.log('✅ React root found');
    }
  }
  
  // Check if we're on the right page
  if (window.location.pathname.includes('/artist')) {
    console.log('✅ On artist dashboard');
  } else {
    console.log('ℹ️ Not on artist dashboard');
  }
}

// Monitor for notification-related logs
function startLogMonitoring() {
  console.log('\n🔍 Starting Log Monitoring...');
  console.log('👀 Watch for these patterns in the console:');
  console.log('   - 🔔 Notification received');
  console.log('   - 📱 User joined room');
  console.log('   - ✅ Socket connected');
  
  // Override console.log to highlight notifications
  const originalLog = console.log;
  console.log = function(...args) {
    const message = args.join(' ');
    if (message.includes('🔔') || message.includes('notification') || message.includes('Notification')) {
      originalLog.apply(console, ['🔔 HIGHLIGHTED:', ...args]);
    } else {
      originalLog.apply(console, args);
    }
  };
}

// Create a manual notification test
function createManualNotification() {
  console.log('\n🔍 Creating Manual Notification Test...');
  
  const auth = checkAuth();
  if (!auth) return;
  
  // Create a test notification object
  const testNotification = {
    id: Date.now().toString(),
    from: {
      userId: 'system',
      email: 'system@venu.com',
      role: 'system'
    },
    to: auth.payload.userId,
    type: 'system',
    title: 'Manual Test Notification',
    message: 'This is a manually created test notification',
    data: { manual: true },
    timestamp: new Date().toISOString(),
    read: false
  };
  
  console.log('📝 Test notification:', testNotification);
  
  // Try to trigger notification handlers manually
  if (window.socketManager && window.socketManager.getSocket()) {
    const socket = window.socketManager.getSocket();
    
    // Emit the notification event
    socket.emit('notification', testNotification);
    console.log('📤 Test notification emitted to socket');
    
    // Also try to trigger the notification handler directly
    socket.emit('notification', testNotification);
  }
}

// Check backend connection
function checkBackendConnection() {
  console.log('\n🔍 Checking Backend Connection...');
  
  fetch('http://localhost:3001/health')
    .then(response => response.json())
    .then(data => {
      console.log('✅ Backend is running:', data);
    })
    .catch(error => {
      console.error('❌ Backend connection failed:', error);
      console.log('💡 Make sure your backend server is running on port 3001');
    });
}

// Run all checks
function runDiagnostic() {
  console.log('🚀 Running Notification Diagnostic...');
  
  checkAuth();
  checkSocketIO();
  checkReactComponents();
  startLogMonitoring();
  checkBackendConnection();
  
  // Test existing socket
  setTimeout(() => {
    testExistingSocket();
  }, 1000);
  
  // Create manual notification
  setTimeout(() => {
    createManualNotification();
  }, 2000);
}

// Export functions
window.notificationDebugger = {
  checkAuth,
  checkSocketIO,
  testExistingSocket,
  checkReactComponents,
  createManualNotification,
  checkBackendConnection,
  runDiagnostic
};

console.log('\n🛠️ Available functions:');
console.log('   - notificationDebugger.runDiagnostic()');
console.log('   - notificationDebugger.testExistingSocket()');
console.log('   - notificationDebugger.createManualNotification()');
console.log('   - notificationDebugger.checkBackendConnection()');

// Auto-run
runDiagnostic();
