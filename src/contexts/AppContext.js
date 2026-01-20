// src/contexts/AppContext.js

import { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { user as mockUser, companies as mockCompanies } from '../data/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const router = useRouter();

  const login = (email, password) => {
    // In a real app, you'd verify the password. Here, we just check email.
    if (email === mockUser.email) {
      setUser(mockUser);
      setIsAuthenticated(true);
      setCompanies(mockCompanies);
      router.push('/select-company'); // Redirect to company selection
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setSelectedCompany(null);
    router.push('/login');
  };

  const selectCompany = (companyId) => {
    const company = mockCompanies.find((c) => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
      router.push('/dashboard'); // Redirect to the main dashboard
    }
  };

  const switchCompany = () => {
      setSelectedCompany(null);
      router.push('/select-company');
  }

  const value = {
    user,
    isAuthenticated,
    companies,
    selectedCompany,
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