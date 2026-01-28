// src/components/auth/ProtectedRoute.js
// ARS ERP - Route Protection with Multi-Entity Support

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '@/contexts/AppContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, currentBusiness, loading, isSuperOwner } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Super Owner has access to everything (even with no business selected = combined view)
    if (isSuperOwner) {
      return; // Super Owner always has access
    }

    // Regular user without a business assigned - redirect to login
    if (isAuthenticated && !currentBusiness && router.pathname !== '/select-company') {
      // For regular users, they need a business to be set
      router.replace('/login');
    }
  }, [isAuthenticated, currentBusiness, router, loading, isSuperOwner]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Render conditions:
  // 1. Super Owner - always render (even without specific business)
  // 2. Regular user with business assigned
  // 3. Anyone on the select-company page
  if (isSuperOwner || (isAuthenticated && currentBusiness) || (isAuthenticated && router.pathname === '/select-company')) {
    return children;
  }

  return null; // Return null while redirecting
};

export default ProtectedRoute;