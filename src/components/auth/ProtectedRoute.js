// src/components/auth/ProtectedRoute.js

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '@/contexts/AppContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, selectedCompany, loading } = useAppContext(); // Get loading state
  const router = useRouter();

  useEffect(() => {
    // Wait until loading is false before checking authentication
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && !selectedCompany && router.pathname !== '/select-company') {
      router.replace('/select-company');
      return;
    }
  }, [isAuthenticated, selectedCompany, router, loading]);

  // Show loading screen while session is being checked
  if (loading) {
      return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Authenticating...</div>;
  }

  if ( (isAuthenticated && selectedCompany) || (isAuthenticated && router.pathname === '/select-company')) {
    return children;
  }

  // Fallback loading state
  return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
};

export default ProtectedRoute;