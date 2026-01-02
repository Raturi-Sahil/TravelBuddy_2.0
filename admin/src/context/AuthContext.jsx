import { createContext, useContext, useState, useEffect } from 'react';
import { verifyToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await verifyToken();
      setAdmin(response.data.data);
    } catch (error) {
      localStorage.removeItem('adminToken');
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = (token, email) => {
    localStorage.setItem('adminToken', token);
    setAdmin({ email });
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, loginAdmin, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
