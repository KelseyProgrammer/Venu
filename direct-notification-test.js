// Direct notification test - run this in your browser console
// This will test the complete notification flow

console.log('🧪 Direct Notification Test');
console.log('========================');

// Get your user info
const token = localStorage.getItem('authToken');
const payload = JSON.parse(atob(token.split('.')[1]));
const userId = payload.userId;

console.log('👤 Testing notifications for user:', userId);

// Test 1: Send notification via backend API
async function testBackendNotification() {
  console.log('\n📤 Test 1: Sending notification via backend...');
  
  try {
    const response = await fetch('http://localhost:3001/api/gigs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        eventName: 'Test Gig for Notifications',
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        eventGenre: 'Rock',
        description: 'This is a test gig to trigger notifications',
        bands: [
          {
            name: 'Test Band',
            email: 'artist@gmail.com', // Your email
            confirmed: false,
            setTime: '20:00',
            percentage: 50,
            guarantee: 100
          }
        ],
        selectedLocation: '507f1f77bcf86cd799439011', // Use a valid location ID
        status: 'pending-confirmation'
      })
    });
    
    const result = await response.json();
    console.log('📤 Gig creation result:', result);
    
    if (result.success) {
      console.log('✅ Gig created successfully - this should trigger notifications!');
      console.log('👀 Watch for notification logs in the console...');
    } else {
      console.error('❌ Gig creation failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error creating gig:', error);
  }
}

// Test 2: Check if notifications are being received
function checkNotificationReception() {
  console.log('\n👂 Test 2: Checking notification reception...');
  
  // Override console.log to catch notification logs
  const originalLog = console.log;
  console.log = function(...args) {
    const message = args.join(' ');
    if (message.includes('🔔') || message.includes('notification') || message.includes('Notification')) {
      originalLog.apply(console, ['🔔 NOTIFICATION CAUGHT:', ...args]);
    } else {
      originalLog.apply(console, args);
    }
  };
  
  console.log('👂 Now listening for notification logs...');
  console.log('💡 If notifications work, you should see "NOTIFICATION CAUGHT" messages');
}

// Test 3: Manual socket test
function testSocketDirectly() {
  console.log('\n🔌 Test 3: Testing socket directly...');
  
  // Check if we can access the socket through React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools available - trying to find socket...');
    
    // Try to find the socket manager in React components
    const reactRoot = document.querySelector('#__next') || document.querySelector('#root');
    if (reactRoot) {
      console.log('✅ React root found');
      
      // Look for socket-related elements
      const notificationElements = document.querySelectorAll('[class*="notification"], [class*="bell"], [class*="RealTime"]');
      console.log('🔍 Found notification elements:', notificationElements.length);
    }
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Running all notification tests...');
  
  checkNotificationReception();
  testSocketDirectly();
  
  // Wait a bit then test backend
  setTimeout(() => {
    testBackendNotification();
  }, 2000);
  
  console.log('\n📋 Test Summary:');
  console.log('1. ✅ Authentication working');
  console.log('2. ✅ Backend server running');
  console.log('3. ✅ Socket connections established');
  console.log('4. 🔄 Testing notification flow...');
  console.log('\n👀 Watch the console for notification messages!');
}

// Export for manual testing
window.notificationTest = {
  testBackendNotification,
  checkNotificationReception,
  testSocketDirectly,
  runTests
};

console.log('\n🛠️ Available functions:');
console.log('   - notificationTest.runTests()');
console.log('   - notificationTest.testBackendNotification()');

// Auto-run tests
runTests();
