// Comprnpm ehensive notification debugging and testing solution
// This script will help identify and fix notification issues

console.log('🔧 VENU Notification System Debugger');
console.log('=====================================');

// Step 1: Check authentication
function checkAuth() {
  console.log('\n1️⃣ Checking Authentication...');
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    console.error('❌ No auth token found. Please log in first.');
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

// Step 2: Check socket connection
function checkSocketConnection() {
  console.log('\n2️⃣ Checking Socket Connection...');
  
  // Check if socket manager exists
  if (typeof window !== 'undefined' && window.socketManager) {
    console.log('✅ Socket manager exists');
    console.log('🔌 Connected:', window.socketManager.connected);
    
    const socket = window.socketManager.getSocket();
    if (socket) {
      console.log('🔌 Socket ID:', socket.id);
      console.log('🔌 Socket connected:', socket.connected);
    }
  } else {
    console.log('❌ Socket manager not found');
  }
}

// Step 3: Test socket connection manually
function testSocketConnection() {
  console.log('\n3️⃣ Testing Socket Connection...');
  
  const auth = checkAuth();
  if (!auth) return;
  
  // Check if socket.io is available globally
  if (typeof io === 'undefined') {
    console.log('❌ Socket.io-client not available globally');
    console.log('💡 Try: npm install socket.io-client');
    console.log('💡 Or check if socket.ts is properly imported');
    return;
  }
  
  console.log('🔌 Creating test socket connection...');
  
  const socket = io('http://localhost:3001', {
    auth: { token: auth.token },
    transports: ['polling']
  });
  
  socket.on('connect', () => {
    console.log('✅ Test socket connected:', socket.id);
    
    // Listen for notifications
    socket.on('notification', (notification) => {
      console.log('🔔 Test notification received:', notification);
    });
    
    // Test sending a notification to yourself
    socket.emit('send-notification', {
      targetUserId: auth.payload.userId,
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test notification from the debugger',
      data: { debug: true }
    });
    
    console.log('📤 Test notification sent to:', auth.payload.userId);
    
    // Clean up after 10 seconds
    setTimeout(() => {
      socket.disconnect();
      console.log('🧹 Test socket disconnected');
    }, 10000);
  });
  
  socket.on('connect_error', (error) => {
    console.error('❌ Test socket connection error:', error);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('❌ Test socket disconnected:', reason);
  });
}

// Step 4: Check real-time hooks
function checkRealTimeHooks() {
  console.log('\n4️⃣ Checking Real-time Hooks...');
  
  // Check if we're on the artist dashboard
  if (window.location.pathname.includes('/artist')) {
    console.log('✅ On artist dashboard');
    
    // Look for real-time hook in React DevTools or global variables
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('✅ React DevTools available');
    }
  } else {
    console.log('ℹ️ Not on artist dashboard, some checks may not apply');
  }
}

// Step 5: Test notification API endpoint
async function testNotificationAPI() {
  console.log('\n5️⃣ Testing Notification API...');
  
  const auth = checkAuth();
  if (!auth) return;
  
  try {
    const response = await fetch('/api/test-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify({
        targetUserId: auth.payload.userId,
        type: 'system',
        title: 'API Test Notification',
        message: 'This notification was sent via API endpoint'
      })
    });
    
    const result = await response.json();
    console.log('📤 API test result:', result);
  } catch (error) {
    console.error('❌ API test error:', error);
  }
}

// Step 6: Monitor console logs
function monitorLogs() {
  console.log('\n6️⃣ Monitoring Console Logs...');
  console.log('👀 Watch for these log patterns:');
  console.log('   - ✅ Optimized Socket.IO connected');
  console.log('   - 📱 User [email] joined room: user:[userId]');
  console.log('   - 🔔 Notification sent to user [userId]');
  console.log('   - 🔔 FRONTEND: Received notification');
  console.log('   - 🔔 ARTIST HOOK: Received notification');
  
  // Override console.log to highlight notification-related logs
  const originalLog = console.log;
  console.log = function(...args) {
    const message = args.join(' ');
    if (message.includes('🔔') || message.includes('notification')) {
      originalLog.apply(console, ['🔔 HIGHLIGHTED:', ...args]);
    } else {
      originalLog.apply(console, args);
    }
  };
}

// Step 7: Create a test notification manually
function createTestNotification() {
  console.log('\n7️⃣ Creating Test Notification...');
  
  const auth = checkAuth();
  if (!auth) return;
  
  // Create a fake notification object
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
  
  console.log('📝 Test notification object:', testNotification);
  
  // Try to trigger the notification handler manually
  if (window.socketManager && window.socketManager.getSocket()) {
    const socket = window.socketManager.getSocket();
    socket.emit('notification', testNotification);
    console.log('📤 Test notification emitted to socket');
  }
}

// Run all checks
function runFullDiagnostic() {
  console.log('🚀 Running Full Notification Diagnostic...');
  
  checkAuth();
  checkSocketConnection();
  checkRealTimeHooks();
  monitorLogs();
  
  // Run async tests
  setTimeout(() => {
    testSocketConnection();
  }, 1000);
  
  setTimeout(() => {
    testNotificationAPI();
  }, 2000);
  
  setTimeout(() => {
    createTestNotification();
  }, 3000);
}

// Export functions for manual testing
window.notificationDebugger = {
  checkAuth,
  checkSocketConnection,
  testSocketConnection,
  checkRealTimeHooks,
  testNotificationAPI,
  createTestNotification,
  runFullDiagnostic
};

console.log('\n🛠️ Available functions:');
console.log('   - notificationDebugger.runFullDiagnostic()');
console.log('   - notificationDebugger.testSocketConnection()');
console.log('   - notificationDebugger.createTestNotification()');
console.log('   - notificationDebugger.testNotificationAPI()');

// Auto-run diagnostic
runFullDiagnostic();
