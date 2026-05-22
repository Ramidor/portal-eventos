import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

export type User = {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]     = useState<User | null>(null);
  const [token, setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(['token', 'user']).then(([[, tok], [, usr]]) => {
      if (tok && usr) { setToken(tok); setUser(JSON.parse(usr)); }
    }).finally(() => setLoading(false));
  }, []);

  const login = async (userData: User, jwt: string) => {
    setUser(userData);
    setToken(jwt);
    await AsyncStorage.multiSet([['token', jwt], ['user', JSON.stringify(userData)]]);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove(['token', 'user']);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isAdmin: user?.role === 'ADMIN', login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
