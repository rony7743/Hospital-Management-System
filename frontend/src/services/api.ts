import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Resolves backend URL automatically:
// - On Mobile Expo Go: Uses host machine IP (e.g., http://192.168.0.111:5000)
// - On Android Emulator: http://10.0.2.2:5000
// - On Web: http://localhost:5000
const getDefaultBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // When testing with mobile Expo Go, hostUri contains the PC IP (e.g. "192.168.0.111:8081")
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost') {
      return `http://${ip}:5000`;
    }
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }

  // Default LAN IP for physical device / emulator
  return 'http://192.168.0.111:5000';
};

export const API_BASE_URL = getDefaultBaseUrl();


export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    fullName: string;
    phone?: string;
    profile?: any;
  };
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'patient' | 'doctor' | 'staff';
  gender?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  specialization?: string;
  designation?: string;
  address?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// Request helper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await AsyncStorage.getItem('@auth_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({
      success: false,
      message: `Server returned ${response.status}: ${response.statusText}`,
    }));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data as T;
  } catch (error: any) {
    // If connection refused or network error
    if (error.message === 'Network request failed' || error.name === 'TypeError') {
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Ensure backend is running.`);
    }
    throw error;
  }
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    return request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMe: async (): Promise<{ success: boolean; user: AuthResponse['user'] }> => {
    return request<{ success: boolean; user: AuthResponse['user'] }>('/api/auth/me', {
      method: 'GET',
    });
  },
};

