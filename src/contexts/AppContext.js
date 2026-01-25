// src/contexts/AppContext.js

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { companies as mockCompanies } from '../data/mockData';

const AppContext = createContext();

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
      // NEW: We now call our internal Next.js API route!
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
      return 'Could not connect to the server.';
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setSelectedCompany(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('selectedCompany');
    router.push('/login');
  };

  const selectCompany = (companyId) => {
    const company = mockCompanies.find((c) => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
      sessionStorage.setItem('selectedCompany', JSON.stringify(company));
      router.push('/dashboard');
    }
  };

  const switchCompany = () => {
      setSelectedCompany(null);
      sessionStorage.removeItem('selectedCompany');
      router.push('/select-company');
  }

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