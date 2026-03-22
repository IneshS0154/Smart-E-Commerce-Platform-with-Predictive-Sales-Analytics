import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    const token = authService.isAuthenticated();
    
    if (storedUser && token) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await authService.login(username, password);
    if (response.success) {
      setUser(response.data);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, message: response.message };
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    if (response.success) {
      setUser(response.data);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, message: response.message };
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;
