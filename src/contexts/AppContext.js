// src/contexts/AppContext.js

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { companies as mockCompanies } from '../data/mockData';

const AppContext = createContext();

// NEW: Get the API URL from the environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      const storedCompany = sessionStorage.getItem('selectedCompany');

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setCompanies(mockCompanies);
        if (storedCompany) {
          setSelectedCompany(JSON.parse(storedCompany));
        }
      }
    } catch (error) {
      console.error("Could not rehydrate session.", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const loggedInUser = data.user;
        setUser(loggedInUser);
        setIsAuthenticated(true);
        setCompanies(mockCompanies);
        sessionStorage.setItem('user', JSON.stringify(loggedInUser));

        if (loggedInUser.role === 'admin') {
          router.push('/select-company');
        } else if (loggedInUser.role === 'user' && loggedInUser.company_id) {
          selectCompany(loggedInUser.company_id);
        } else {
          router.push('/login?error=no_company');
        }
        return true;
      } else {
        return data.message || 'Invalid credentials.';
      }
    } catch (error) {
      console.error('Login error:', error);
      // This is the error you are seeing
      return 'Could not connect to the server. Please check your connection or contact support.'; 
    }
  };

  const logout = () => { /* ... no change ... */ };
  const selectCompany = (companyId) => { /* ... no change ... */ };
  const switchCompany = () => { /* ... no change ... */ }

  const value = {
    user,
    isAuthenticated,
    companies,
    selectedCompany,
    loading,
    login,
    logout,
    selectCompany,
    switchCompany,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}