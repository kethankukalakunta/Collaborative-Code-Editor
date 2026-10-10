import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from local storage and verify with backend
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('sync_code_token');
      const savedUser = localStorage.getItem('sync_code_user');

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {}
      }

      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data?.data?.user) {
            setUser(res.data.data.user);
            localStorage.setItem('sync_code_user', JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          localStorage.removeItem('sync_code_token');
          localStorage.removeItem('sync_code_user');
          await createGuestSession();
        }
      } else {
        // Automatically create guest user if none exists
        await createGuestSession();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const { token, user: loggedInUser } = res.data.data;
      localStorage.setItem('sync_code_token', token);
      localStorage.setItem('sync_code_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      toast.success(`Welcome back, ${loggedInUser.displayName}!`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (username, displayName, email, password) => {
    try {
      const res = await authAPI.register({ username, displayName, email, password });
      const { token, user: newUser } = res.data.data;
      localStorage.setItem('sync_code_token', token);
      localStorage.setItem('sync_code_user', JSON.stringify(newUser));
      setUser(newUser);
      toast.success(`Account created! Welcome, ${newUser.displayName}!`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const createGuestSession = async (customName = '') => {
    try {
      const res = await authAPI.guest(customName);
      const { token, user: guestUser } = res.data.data;
      localStorage.setItem('sync_code_token', token);
      localStorage.setItem('sync_code_user', JSON.stringify(guestUser));
      setUser(guestUser);
      return guestUser;
    } catch (err) {
      // Offline fallback guest
      const fallbackGuest = {
        id: `guest_${Math.random().toString(36).substr(2, 6)}`,
        displayName: customName || `Guest ${Math.floor(100 + Math.random() * 900)}`,
        username: `guest_${Math.random().toString(36).substr(2, 6)}`,
        isGuest: true,
        color: '#3b82f6',
      };
      setUser(fallbackGuest);
      localStorage.setItem('sync_code_user', JSON.stringify(fallbackGuest));
      return fallbackGuest;
    }
  };

  const logout = () => {
    localStorage.removeItem('sync_code_token');
    localStorage.removeItem('sync_code_user');
    setUser(null);
    createGuestSession();
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        createGuestSession,
        logout,
        isAuthenticated: !!user && !user.isGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
