'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import type { Role, User } from './types';
import { authApi, tokenStore, userStore } from './api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    instituteName: string;
    domain: string;
    country: string;
    name: string;
    email: string;
    password: string;
  }) => Promise<User>;
  logout: () => void;
  setUser: (u: User) => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const t = tokenStore.get();
    const u = userStore.get();
    if (t && u) {
      setToken(t);
      setUserState(u);
    }
    setIsLoading(false);
  }, []);

  const setUser = useCallback((u: User) => {
    setUserState(u);
    userStore.set(u);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    tokenStore.set(res.token);
    userStore.set(res.user);
    setToken(res.token);
    setUserState(res.user);
    return res.user;
  }, []);

  const register = useCallback(
    async (payload: Parameters<AuthContextValue['register']>[0]) => {
      const res = await authApi.register(payload);
      tokenStore.set(res.token);
      userStore.set(res.user);
      setToken(res.token);
      setUserState(res.user);
      return res.user;
    },
    [],
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    userStore.clear();
    setToken(null);
    setUserState(null);
    router.push('/login');
  }, [router]);

  const hasRole = useCallback(
    (...roles: Role[]) => (user ? roles.includes(user.role) : false),
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        setUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
