"use client"

import { useState, useEffect } from 'react';

// Authentication debug component for development
export function AuthDebugPanel() {
  const [authStatus, setAuthStatus] = useState<{
    hasToken: boolean;
    tokenValid: boolean;
    userRole?: string;
    error?: string;
  }>({
    hasToken: false,
    tokenValid: false
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const hasToken = !!token;
      
      if (!hasToken) {
        setAuthStatus({ hasToken: false, tokenValid: false });
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAuthStatus({
            hasToken: true,
            tokenValid: true,
            userRole: data.data?.role
          });
        } else {
          setAuthStatus({
            hasToken: true,
            tokenValid: false,
            error: `HTTP ${response.status}: ${response.statusText}`
          });
        }
      } catch (error) {
        setAuthStatus({
          hasToken: true,
          tokenValid: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    checkAuth();
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Token: {authStatus.hasToken ? '✅ Present' : '❌ Missing'}</div>
        <div>Valid: {authStatus.tokenValid ? '✅ Valid' : '❌ Invalid'}</div>
        {authStatus.userRole && <div>Role: {authStatus.userRole}</div>}
        {authStatus.error && <div className="text-red-300">Error: {authStatus.error}</div>}
      </div>
      <button 
        onClick={() => localStorage.removeItem('authToken')}
        className="mt-2 text-xs bg-red-600 px-2 py-1 rounded"
      >
        Clear Token
      </button>
    </div>
  );
}
