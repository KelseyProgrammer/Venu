// Emergency fix: Completely disable all API calls until authentication is cleared
// Run this in the browser console to immediately stop all API errors

console.log('🚨 EMERGENCY: Disabling all API calls...');

// Override fetch to block all API calls
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  // Block all calls to the API
  if (typeof url === 'string' && url.includes('/api/')) {
    console.log('🚫 BLOCKED API CALL:', url);
    return Promise.resolve(new Response(JSON.stringify({
      success: false,
      error: 'Authentication required'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  return originalFetch.apply(this, arguments);
};

// Clear all storage
localStorage.clear();
sessionStorage.clear();

// Clear cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

console.log('✅ All API calls blocked and storage cleared!');
console.log('🔄 Redirecting to login...');

// Force redirect
setTimeout(() => {
  window.location.href = '/';
}, 1000);
