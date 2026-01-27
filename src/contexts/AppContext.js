// src/contexts/AppContext.js

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch companies helper
  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCompanies(data);
        return data;
      }
    } catch (err) {
      console.error("Failed to load companies", err);
    }
    return [];
  };

  useEffect(() => {
    // Rehydrate session on refresh
    const initAuth = async () => {
      try {
        const storedUser = sessionStorage.getItem('user');
        const storedToken = sessionStorage.getItem('token');
        const storedCompany = sessionStorage.getItem('selectedCompany');

        // Always fetch fresh companies list
        const fetchedCompanies = await fetchCompanies();

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
          setIsAuthenticated(true);

          if (storedCompany) {
            setSelectedCompany(JSON.parse(storedCompany));
          }
        }
      } catch (error) {
        console.error("Could not rehydrate session.", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
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
        const authToken = data.token;

        setUser(loggedInUser);
        setToken(authToken);
        setIsAuthenticated(true);

        // Ensure we have the latest company list
        const currentCompanies = await fetchCompanies();

        sessionStorage.setItem('user', JSON.stringify(loggedInUser));
        sessionStorage.setItem('token', authToken);

        // Role-based redirection
        if (loggedInUser.role === 'ADMIN' || loggedInUser.role === 'MANAGER') {
          if (loggedInUser.role === 'ADMIN' || !loggedInUser.company_id) {
            router.push('/select-company');
          } else {
            const companyObj = currentCompanies.find(c => c.id === loggedInUser.company_id);
            if (companyObj) {
              selectCompany(companyObj.id);
            } else {
              router.push('/select-company');
            }
          }
        } else if (loggedInUser.role === 'USER' && loggedInUser.company_id) {
          // Find company object
          const companyObj = currentCompanies.find(c => c.id === loggedInUser.company_id);

          if (companyObj) {
            selectCompany(companyObj.id);
          } else {
            console.error("Assigned company ID not found in database");
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
    setToken(null);
    setIsAuthenticated(false);
    setSelectedCompany(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('selectedCompany');
    router.push('/login');
  };

  const selectCompany = (companyId) => {
    const company = companies.find((c) => c.id === companyId);
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
    token,
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