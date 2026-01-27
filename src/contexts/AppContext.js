// src/contexts/AppContext.js
// ARS ERP - Global App Context with Multi-Entity Support

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch all businesses (for Super Owner company switching)
  const fetchBusinesses = async () => {
    try {
      const res = await fetch('/api/businesses');
      const data = await res.json();
      if (Array.isArray(data)) {
        setBusinesses(data);
        return data;
      }
    } catch (err) {
      console.error("Failed to load businesses", err);
    }
    return [];
  };

  // Rehydrate session on page refresh
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = sessionStorage.getItem('ars_user');
        const storedBusiness = sessionStorage.getItem('ars_current_business');

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);

          // Fetch businesses for Super Owner
          if (parsedUser.isSuperOwner) {
            await fetchBusinesses();
          }

          if (storedBusiness) {
            setCurrentBusiness(JSON.parse(storedBusiness));
          } else if (parsedUser.business) {
            // Set default business from user's assigned business
            setCurrentBusiness(parsedUser.business);
          }
        }
      } catch (error) {
        console.error("Session rehydration failed:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function - handles role-based redirects
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        const loggedInUser = data.user;
        
        setUser(loggedInUser);
        setIsAuthenticated(true);
        sessionStorage.setItem('ars_user', JSON.stringify(loggedInUser));

        // Role-based redirect logic
        if (loggedInUser.isSuperOwner) {
          // Super Owner: Fetch all businesses and go to Owner Dashboard
          const allBusinesses = await fetchBusinesses();
          setBusinesses(allBusinesses);
          
          // Default to combined view (no specific business selected)
          router.push('/dashboard');
        } else if (loggedInUser.business) {
          // Regular user: Set their assigned business and go to dashboard
          setCurrentBusiness(loggedInUser.business);
          sessionStorage.setItem('ars_current_business', JSON.stringify(loggedInUser.business));
          
          // Redirect based on business type
          if (loggedInUser.business.type === 'PETROL_PUMP') {
            router.push('/dashboard'); // Will show Pump Dashboard
          } else if (loggedInUser.business.type === 'LUBRICANT') {
            router.push('/dashboard'); // Will show Lube Dashboard
          } else {
            router.push('/dashboard');
          }
        } else {
          // No business assigned - error
          return 'No company assigned to this account. Contact admin.';
        }
        
        return true;
      } else {
        return data.message || 'Invalid credentials.';
      }
    } catch (error) {
      console.error('Login error:', error);
      return 'Could not connect to the server.';
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentBusiness(null);
    setBusinesses([]);
    sessionStorage.removeItem('ars_user');
    sessionStorage.removeItem('ars_current_business');
    router.push('/login');
  };

  // Switch business (Super Owner only)
  const switchBusiness = (businessId) => {
    if (!user?.isSuperOwner) {
      console.error("Only Super Owner can switch businesses");
      return;
    }

    if (businessId === null || businessId === 'all') {
      // Combined view - all businesses
      setCurrentBusiness(null);
      sessionStorage.removeItem('ars_current_business');
    } else {
      const business = businesses.find((b) => b.id === businessId);
      if (business) {
        setCurrentBusiness(business);
        sessionStorage.setItem('ars_current_business', JSON.stringify(business));
      }
    }
  };

  // Check if user has a specific permission
  const hasPermission = (permissionKey, action = null) => {
    if (!user?.role?.permissions) return false;
    
    const perms = user.role.permissions;
    
    // Super Owner has all permissions
    if (perms.all === true) return true;
    
    // Check specific permission
    if (action) {
      return perms[permissionKey]?.includes(action) || false;
    }
    
    return !!perms[permissionKey];
  };

  // Format currency in BDT
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '৳0';
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount).replace('BDT', '৳');
  };

  // Format date in DD/MM/YYYY
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      timeZone: 'Asia/Dhaka'
    });
  };

  const value = {
    // Auth state
    user,
    isAuthenticated,
    loading,
    
    // Business context
    businesses,
    currentBusiness,
    
    // Actions
    login,
    logout,
    switchBusiness,
    hasPermission,
    
    // Helpers
    formatCurrency,
    formatDate,
    
    // Convenience flags
    isSuperOwner: user?.isSuperOwner || false,
    isViewingAllBusinesses: user?.isSuperOwner && !currentBusiness
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}