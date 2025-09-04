// Clear all authentication data and redirect to login
// Run this in the browser console to fix the authentication issues

console.log('🧹 Clearing all authentication data...');

// Clear all localStorage items
localStorage.clear();

// Also clear sessionStorage just in case
sessionStorage.clear();

// Clear any cookies that might be set
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

console.log('✅ All authentication data cleared!');
console.log('🔄 Redirecting to login page...');

// Force a hard refresh to clear any cached data
window.location.href = '/';
