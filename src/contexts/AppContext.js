// src/contexts/AppContext.js

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { companies as mockCompanies } from '../data/mockData'; // Keeping mock structure for UI elements

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Rehydrate session on refresh
    try {
      const storedUser = sessionStorage.getItem('user');
      const storedCompany = sessionStorage.getItem('selectedCompany');

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setCompanies(mockCompanies); // In real app, fetch these from DB too

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
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        const loggedInUser = data.user;
        
        // Update State
        setUser(loggedInUser);
        setIsAuthenticated(true);
        setCompanies(mockCompanies);
        
        // Persist Session
        sessionStorage.setItem('user', JSON.stringify(loggedInUser));

        // --- KEY REDIRECTION LOGIC ---
        if (loggedInUser.role === 'admin') {
          // Admin gets to choose
          router.push('/select-company');
        } else if (loggedInUser.role === 'user' && loggedInUser.company_id) {
          // Normal User is FORCED to their company
          // Find the full company object from mock data based on the DB ID
          const companyObj = mockCompanies.find(c => c.id === loggedInUser.company_id);
          
          if (companyObj) {
            selectCompany(companyObj.id);
          } else {
            // Fallback if company ID in DB doesn't match config
            console.error("Assigned company ID not found in configuration");
            router.push('/login?error=config_mismatch');
          }
        } else {
          router.push('/login?error=no_company_assigned');
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
    // Only Admins should really call this, but we handle security in the page too
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