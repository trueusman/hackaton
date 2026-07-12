import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { authApi } from '../api/authApi';
import { setAccessToken, setUnauthorizedHandler } from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
  }, [clearSession]);

  // On first load, try to silently refresh using the httpOnly cookie so a
  // page reload doesn't force a re-login while the refresh token is valid.
  useEffect(() => {
    (async () => {
      try {
        const { user: refreshedUser, accessToken } = await authApi.refresh();
        setAccessToken(accessToken);
        setUser(refreshedUser);
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    const { user: loggedInUser, accessToken } = await authApi.login(credentials);
    setAccessToken(accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: registeredUser, accessToken } = await authApi.register(payload);
    setAccessToken(accessToken);
    setUser(registeredUser);
    return registeredUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: !!user, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
