import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';


export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F8FAFC',
        }}
      >
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={{ marginTop: 12, fontSize: 14, color: '#64748B' }}>
          Loading Hospital Portal...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingVertical: 6,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: '#E0F2FE',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Text style={{ fontSize: 22 }}>🏥</Text>
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F172A' }}>
                MediCare Hospital
              </Text>
              <Text style={{ fontSize: 12, color: '#64748B' }}>
                Central Medical Center
              </Text>
            </View>
          </View>

          {isAuthenticated ? (
            <TouchableOpacity
              style={{
                backgroundColor: '#FEE2E2',
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 8,
              }}
              onPress={async () => {
                await logout();
              }}
            >
              <Text style={{ color: '#DC2626', fontWeight: '600', fontSize: 13 }}>
                Sign Out
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor: '#0284C7',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              }}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 13 }}>
                Sign In
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <Image
            source={require('../../assets/images/hero-banner.png')}
            style={{ width: '100%', height: 180 }}
            contentFit="cover"
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.03,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Ionicons name="search-outline" size={20} color="#94A3B8" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Search for specialist doctors..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, fontSize: 14, color: '#0F172A' }}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FEE2E2',
            borderWidth: 1,
            borderColor: '#FECACA',
            borderRadius: 14,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 28 }}>🚑</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#B91C1C' }}>
              Emergency Ambulance Hotline
            </Text>
            <Text style={{ fontSize: 13, color: '#991B1B', marginTop: 2, fontWeight: '600' }}>
              +880 1700 000000 (Hotline: 10666)
            </Text>
          </View>
        </View>

        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A' }}>
            Hospital Services
          </Text>
          <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
            Integrated healthcare facilities
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            rowGap: 12,
            marginBottom: 24,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              padding: 16,
              width: '48%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 2,
            }}
            onPress={() => router.push('/doctors' as any)}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: '#E0F2FE',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 22 }}>🩺</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 6 }}>
              Doctor Appointments
            </Text>
            <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 16 }}>
              Book expert consultations across 15+ specialized medical departments.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              padding: 16,
              width: '48%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 2,
            }}
            onPress={() => router.push('/lab-tests' as any)}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: '#DCFCE7',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 22 }}>🔬</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 6 }}>
              Lab & Diagnostics
            </Text>
            <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 16 }}>
              High-precision pathology, blood tests, radiology, and online test reports.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              padding: 16,
              width: '48%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 2,
            }}
            onPress={() => router.push('/beds' as any)}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: '#FEF3C7',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 22 }}>🛏️</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 6 }}>
              Wards & ICU Beds
            </Text>
            <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 16 }}>
              Emergency admissions, ICU, CCU, and general bed occupancy tracking.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              padding: 16,
              width: '48%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 2,
            }}
            onPress={() => router.push('/pharmacy' as any)}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: '#F3E8FF',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 22 }}>💊</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 6 }}>
              24/7 Pharmacy
            </Text>
            <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 16 }}>
              Genuine medicines, prescription fulfillment, and inventory management.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              padding: 16,
              width: '48%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 2,
            }}
            onPress={() => (!isAuthenticated ? router.push('/(auth)/login') : null)}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: '#E0E7FF',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 22 }}>📹</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 6 }}>
              Teleconsultation
            </Text>
            <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 16 }}>
              Connect with top doctors via video call directly from home.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              padding: 16,
              width: '48%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 2,
            }}
            onPress={() => (!isAuthenticated ? router.push('/(auth)/login') : null)}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: '#FFE4E6',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 22 }}>🩸</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 6 }}>
              Blood Bank
            </Text>
            <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 16 }}>
              Search blood donors and check real-time blood group availability.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              padding: 16,
              width: '48%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 2,
            }}
            onPress={() => (!isAuthenticated ? router.push('/(auth)/login') : null)}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: '#CCFBF1',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 22 }}>🏠</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 6 }}>
              Home Healthcare
            </Text>
            <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 16 }}>
              Professional home nursing care, dressing, and elderly assistance.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              padding: 16,
              width: '48%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 2,
            }}
            onPress={() => (!isAuthenticated ? router.push('/(auth)/login') : null)}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: '#FFEDD5',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 22 }}>📑</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 6 }}>
              Medical Records
            </Text>
            <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 16 }}>
              Secure digital access to prescriptions, invoices, and lab reports.
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: '#0F172A',
            borderRadius: 16,
            paddingVertical: 20,
            paddingHorizontal: 12,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            marginBottom: 28,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#38BDF8' }}>50+</Text>
            <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>Specialist Doctors</Text>
          </View>
          <View style={{ width: 1, height: 28, backgroundColor: '#334155' }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#38BDF8' }}>120+</Text>
            <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>Hospital Beds</Text>
          </View>
          <View style={{ width: 1, height: 28, backgroundColor: '#334155' }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#38BDF8' }}>24/7</Text>
            <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>Emergency Care</Text>
          </View>
        </View>

        <View
          style={{
            alignItems: 'center',
            paddingVertical: 20,
            borderTopWidth: 1,
            borderTopColor: '#E2E8F0',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 6 }}>
            🏥 PetCare General Hospital
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: '#64748B',
              textAlign: 'center',
              lineHeight: 18,
              marginBottom: 10,
            }}
          >
            Medical College Road, Dhaka, Bangladesh{'\n'}
            Visiting Hours: Daily 10:00 AM – 08:00 PM
          </Text>
          <Text style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center' }}>
            © 2026 PetCare Hospital Management System. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}