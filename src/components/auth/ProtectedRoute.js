// src/components/auth/ProtectedRoute.js

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '@/contexts/AppContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, selectedCompany, loading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // If logged in but no company selected (and not on the selection page)
    // redirect to selection (Admins) or back to login if something is broken
    if (isAuthenticated && !selectedCompany && router.pathname !== '/select-company') {
      router.replace('/select-company');
    }
  }, [isAuthenticated, selectedCompany, router, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Render children if conditions are met
  if ((isAuthenticated && selectedCompany) || (isAuthenticated && router.pathname === '/select-company')) {
    return children;
  }

  return null; // Return null while redirecting
};

export default ProtectedRoute;