import { Platform } from 'react-native';
import { safeStorage } from '../utils/storage';
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
  role: 'patient' | 'doctor' | 'admin';
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
  const token = await safeStorage.getItem('@auth_token');


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

// 1. Doctors & Departments API
export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  qualifications: string;
  experienceYears: number;
  consultationFee: string | number;
  roomNumber?: string;
  isAvailable: boolean;
  department?: {
    id: string;
    name: string;
  };
  schedules?: Array<{
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }>;
}

export const doctorApi = {
  getDoctors: async (params?: { departmentId?: string; search?: string }): Promise<{ success: boolean; doctors: Doctor[] }> => {
    const query = new URLSearchParams();
    if (params?.departmentId) query.append('departmentId', params.departmentId);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ success: boolean; doctors: Doctor[] }>(`/api/doctors${qs}`);
  },
  getDepartments: async (): Promise<{ success: boolean; departments: Array<{ id: string; name: string }> }> => {
    return request<{ success: boolean; departments: Array<{ id: string; name: string }> }>('/api/doctors/departments');
  },
};

// 2. Appointments API
export interface Appointment {
  id: string;
  appointmentDate: string;
  timeSlot?: string;
  serialNumber?: number;
  reason?: string;
  status: string;
  doctor?: Doctor;
  patient?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export const appointmentApi = {
  bookAppointment: async (data: {
    doctorId: string;
    appointmentDate: string;
    timeSlot?: string;
    reason?: string;
    patientName?: string;
    patientPhone?: string;
  }): Promise<{ success: boolean; message: string; appointment: Appointment }> => {
    return request('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getAppointments: async (): Promise<{ success: boolean; appointments: Appointment[] }> => {
    return request('/api/appointments');
  },
};

// 3. Lab Tests API
export interface LabCatalogItem {
  id: string;
  testName: string;
  category: string;
  cost: number;
  turnaround: string;
}

export const labTestApi = {
  getCatalog: async (): Promise<{ success: boolean; catalog: LabCatalogItem[] }> => {
    return request('/api/lab-tests/catalog');
  },
  bookLabTest: async (data: {
    testName: string;
    category?: string;
    cost?: number;
    patientName?: string;
    patientPhone?: string;
  }): Promise<{ success: boolean; message: string }> => {
    return request('/api/lab-tests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getLabTests: async (): Promise<{ success: boolean; labTests: any[] }> => {
    return request('/api/lab-tests');
  },
};

// 4. Wards & Beds API
export interface WardItem {
  id: string;
  name: string;
  type: string;
  floorNumber: number;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  beds: Array<{
    id: string;
    bedNumber: string;
    dailyCharge: string | number;
    isOccupied: boolean;
  }>;
}

export const wardApi = {
  getWards: async (): Promise<{ success: boolean; wards: WardItem[] }> => {
    return request('/api/wards');
  },
};

// 5. Pharmacy & Medicines API
export interface MedicineItem {
  id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer?: string;
  unitPrice: string | number;
  stockQuantity: number;
}

export const pharmacyApi = {
  getMedicines: async (params?: { search?: string; category?: string }): Promise<{ success: boolean; medicines: MedicineItem[] }> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/api/medicines${qs}`);
  },
  getCategories: async (): Promise<{ success: boolean; categories: string[] }> => {
    return request('/api/medicines/categories');
  },
};


