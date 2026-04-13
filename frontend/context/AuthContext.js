import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [token,   setToken]   = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const t = localStorage.getItem('np_token');
    const u = localStorage.getItem('np_user');
    if (t && u) {
      try {
        setToken(t);
        setUser(JSON.parse(u));
      } catch {}
    }
    setLoading(false);
  }, []);

  const persist = (token, user) => {
    localStorage.setItem('np_token', token);
    localStorage.setItem('np_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const signup = async (name, email, password) => {
    const { data } = await authAPI.signup({ name, email, password });
    persist(data.token, data.user);
    return data;
  };

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    persist(data.token, data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('np_token');
    localStorage.removeItem('np_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await userAPI.getProfile();
      setUser(data);
      localStorage.setItem('np_user', JSON.stringify(data));
      return data;
    } catch {}
  }, []);

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('np_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
