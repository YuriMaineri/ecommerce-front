import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService } from '../api/auth.service';
import { TOKEN_STORAGE_KEY } from '../api/client';
import type { AuthUser, LoginPayload, RegisterPayload } from '../types';
import { AuthContext, type AuthContextValue } from './auth-context';

const USER_STORAGE_KEY = 'ecommerce.user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessao do localStorage no carregamento e valida o token.
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!storedToken) {
      setLoading(false);
      return;
    }
    setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as AuthUser);
      } catch {
        // ignora json corrompido
      }
    }
    // Revalida contra a API; se o token expirou, limpa a sessao.
    authService
      .me()
      .then((fresh) => {
        setUser(fresh);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fresh));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = useCallback((accessToken: string, authUser: AuthUser) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    setToken(accessToken);
    setUser(authUser);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const result = await authService.login(payload);
      persistSession(result.accessToken, result.user);
    },
    [persistSession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await authService.register(payload);
      // Apos registrar, autentica automaticamente.
      const result = await authService.login({ email: payload.email, password: payload.password });
      persistSession(result.accessToken, result.user);
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
