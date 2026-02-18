import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useConfig } from '@/config';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
}

export interface AuthResponse {
  ok: boolean;
  data?: {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, name: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const config = useConfig();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${config.apiOrigin}/auth/me`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.ok && data.data?.user) {
          setUser(data.data.user);
        }
      } catch {
        // Not logged in
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [config.apiOrigin]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${config.apiOrigin}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data: AuthResponse = await res.json();
      if (data.ok && data.data) {
        setUser({
          id: data.data.id,
          email: data.data.email,
          name: data.data.name,
          avatar_url: data.data.avatar_url || null,
        });
        return { ok: true };
      }
      return { ok: false, error: data.error?.message || 'Login failed' };
    } catch (err) {
      return { ok: false, error: 'Network error' };
    }
  };

  const register = async (email: string, name: string, password: string) => {
    try {
      const res = await fetch(`${config.apiOrigin}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, name, password }),
      });
      const data: AuthResponse = await res.json();
      if (data.ok && data.data) {
        setUser({
          id: data.data.id,
          email: data.data.email,
          name: data.data.name,
          avatar_url: data.data.avatar_url || null,
        });
        return { ok: true };
      }
      return { ok: false, error: data.error?.message || 'Registration failed' };
    } catch (err) {
      return { ok: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${config.apiOrigin}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
