// src/components/auth/ProtectedRoute.js

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '@/contexts/AppContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, selectedCompany, loading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Role check
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      // If user doesn't have required role, redirect to dashboard or login
      // Use replace to avoid history stack issues
      console.warn(`Access denied. User role ${user.role} is not in [${allowedRoles.join(', ')}]`);
      router.replace('/dashboard'); // or /unauthorized
      return;
    }

    // If logged in but no company selected (and not on the selection page)
    if (isAuthenticated && !selectedCompany && router.pathname !== '/select-company') {
      router.replace('/select-company');
    }
  }, [isAuthenticated, selectedCompany, router, loading, user, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Render children if conditions are met
  if ((isAuthenticated && selectedCompany) || (isAuthenticated && router.pathname === '/select-company')) {
    // Second check for rendering safety
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      return null;
    }
    return children;
  }

  return null; // Return null while redirecting
};

export default ProtectedRoute;