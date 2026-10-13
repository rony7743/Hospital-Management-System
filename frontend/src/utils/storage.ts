import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// In-memory fallback if native module is unavailable
const memoryFallback = new Map<string, string>();

export const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      const val = await AsyncStorage.getItem(key);
      return val !== null ? val : (memoryFallback.get(key) || null);
    } catch (err) {
      return memoryFallback.get(key) || null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    memoryFallback.set(key, value);
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (err) {
      // In-memory fallback already set
    }
  },

  removeItem: async (key: string): Promise<void> => {
    memoryFallback.delete(key);
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (err) {
      // In-memory fallback already deleted
    }
  },
};

