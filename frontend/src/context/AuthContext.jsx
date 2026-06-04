import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'coffeeSession';
const AuthContext = createContext(null);

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(readSession);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) setSessionState(readSession());
    };
    window.addEventListener('storage', onStorage);
    const onUnauthorized = () => setSessionState(null);
    window.addEventListener('coffee:unauthorized', onUnauthorized);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('coffee:unauthorized', onUnauthorized);
    };
  }, []);

  const setSession = (nextSession) => {
    if (nextSession) localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    else localStorage.removeItem(STORAGE_KEY);
    setSessionState(nextSession);
    setVersion((v) => v + 1);
  };

  const updateUser = (patch) => {
    setSessionState((current) => {
      if (!current) return current;
      const next = { ...current, user: { ...current.user, ...patch } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setVersion((v) => v + 1);
  };

  const logout = () => setSession(null);
  const refresh = () => setVersion((v) => v + 1);

  const value = useMemo(() => ({
    session,
    user: session?.user || null,
    token: session?.token || null,
    role: session?.user?.role || 'public',
    isLoggedIn: Boolean(session?.token),
    version,
    setSession,
    updateUser,
    logout,
    refresh,
  }), [session, version]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

export function getStoredSession() {
  return readSession();
}
