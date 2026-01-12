// src/contexts/AppContext.js

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { user as mockUser, companies as mockCompanies } from '../data/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true); // NEW: Loading state
  const router = useRouter();

  // NEW: This effect runs once on app load to rehydrate state from sessionStorage
  useEffect(() => {
    try {
      const storedAuth = sessionStorage.getItem('isAuthenticated');
      const storedCompany = sessionStorage.getItem('selectedCompany');

      if (storedAuth === 'true') {
        setIsAuthenticated(true);
        setUser(mockUser);
        setCompanies(mockCompanies);
        if (storedCompany) {
          setSelectedCompany(JSON.parse(storedCompany));
        }
      }
    } catch (error) {
      console.error("Could not rehydrate session state.", error);
    } finally {
      setLoading(false); // Stop loading once done
    }
  }, []);

  const login = (email, password) => {
    if (email === mockUser.email) {
      setUser(mockUser);
      setIsAuthenticated(true);
      setCompanies(mockCompanies);
      sessionStorage.setItem('isAuthenticated', 'true'); // NEW: Save auth state
      router.push('/select-company');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setSelectedCompany(null);
    sessionStorage.removeItem('isAuthenticated'); // NEW: Clear session
    sessionStorage.removeItem('selectedCompany'); // NEW: Clear session
    router.push('/login');
  };

  const selectCompany = (companyId) => {
    const company = mockCompanies.find((c) => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
      sessionStorage.setItem('selectedCompany', JSON.stringify(company)); // NEW: Save company
      router.push('/dashboard');
    }
  };

  const switchCompany = () => {
      setSelectedCompany(null);
      sessionStorage.removeItem('selectedCompany'); // NEW: Clear company
      router.push('/select-company');
  }

  const value = {
    user,
    isAuthenticated,
    companies,
    selectedCompany,
    loading, // NEW: Expose loading state
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