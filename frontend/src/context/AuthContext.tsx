import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, AuthResponse, LoginPayload, RegisterPayload } from '../services/api';

interface User {
  id: string;
  email: string;
  role: string;
  fullName: string;
  phone?: string;
  profile?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore token and user on app startup
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Optionally revalidate token in background
          try {
            const meRes = await authApi.getMe();
            if (meRes.user) {
              setUser(meRes.user as User);
              await AsyncStorage.setItem(USER_KEY, JSON.stringify(meRes.user));
            }
          } catch (e) {
            // Token might be expired
            console.log('Token revalidation failed:', e);
          }
        }
      } catch (error) {
        console.error('Error loading stored authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const login = async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await authApi.login(payload);
    if (response.token && response.user) {
      setToken(response.token);
      setUser(response.user as User);
      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }
    return response;
  };

  const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await authApi.register(payload);
    if (response.token && response.user) {
      setToken(response.token);
      setUser(response.user as User);
      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }
    return response;
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

