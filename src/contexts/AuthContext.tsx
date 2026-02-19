import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useConfig } from '@/config';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  github_username?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, name: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const TOKEN_KEY = 'devsage_access_token';
const USER_KEY = 'devsage_user';

function getStoredToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  token: null,
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
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [loading, setLoading] = useState(true);

  // Verify stored token on mount
  useEffect(() => {
    async function checkAuth() {
      const stored = getStoredToken();
      if (!stored) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${config.apiOrigin}/auth/me`, {
          headers: { Authorization: `Bearer ${stored}` },
        });
        const data = await res.json();
        if (data.ok && data.data?.user) {
          setUser(data.data.user);
        } else {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setUser(null);
          setToken(null);
        }
      } catch {
        // Network error, keep stored user
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
        body: JSON.stringify({ email, password }),
      });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch {
        return { ok: false, error: `Non-JSON (${res.status}): ${text.slice(0, 100)}` };
      }
      if (!data.ok) {
        return { ok: false, error: `API ${res.status}: ${data.error?.message || data.error?.code || text.slice(0, 100)}` };
      }
      if (!data.data) {
        return { ok: false, error: `No data in response: ${text.slice(0, 100)}` };
      }
      const u: User = {
        id: data.data.id,
        email: data.data.email,
        name: data.data.name,
        avatar_url: data.data.avatar_url || null,
      };
      const accessToken = data.data.access_token;
      setUser(u);
      setToken(accessToken || null);
      try {
        if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
      } catch {}
      return { ok: true };
    } catch (err) {
      return { ok: false, error: `Fetch failed: ${err instanceof Error ? err.message : String(err)}` };
    }
  };

  const register = async (email: string, name: string, password: string) => {
    try {
      const res = await fetch(`${config.apiOrigin}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });
      const data = await res.json();
      if (data.ok && data.data) {
        const u: User = {
          id: data.data.id,
          email: data.data.email,
          name: data.data.name,
          avatar_url: data.data.avatar_url || null,
        };
        const accessToken = data.data.access_token;
        setUser(u);
        setToken(accessToken || null);
        try {
          if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
          localStorage.setItem(USER_KEY, JSON.stringify(u));
        } catch {}
        return { ok: true };
      }
      return { ok: false, error: data.error?.message || 'Registration failed' };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${config.apiOrigin}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {}
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
