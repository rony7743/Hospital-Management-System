import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.loadingText}>Loading Hospital Portal...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Bar */}
        <View style={styles.navbar}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>🏥</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>MediCare Hospital</Text>
              <Text style={styles.brandSubtitle}>Central Medical Center</Text>
            </View>
          </View>

          {isAuthenticated ? (
            <TouchableOpacity
              style={styles.navLogoutBtn}
              onPress={async () => {
                await logout();
              }}
            >
              <Text style={styles.navLogoutText}>Sign Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.navLoginBtn}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.navLoginText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Hero Banner Section */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroBadge}>24/7 EMERGENCY & HEALTHCARE</Text>
          <Text style={styles.heroHeadline}>
            Compassionate Care,{'\n'}Advanced Medicine.
          </Text>
          <Text style={styles.heroDesc}>
            Access world-class medical specialists, real-time appointments, diagnostic lab reports, and bed availability with ease.
          </Text>

          {/* User Status / Action Buttons */}
          {isAuthenticated && user ? (
            <View style={styles.loggedInCard}>
              <View style={styles.userStatusHeader}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.welcomeLabel}>Signed in as:</Text>
                  <Text style={styles.userName}>{user.fullName}</Text>
                  <View style={styles.rolePill}>
                    <Text style={styles.rolePillText}>{user.role}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.userActions}>
                <TouchableOpacity
                  style={styles.primaryActionButton}
                  onPress={() => {
                    // Navigate to portal actions
                  }}
                >
                  <Text style={styles.primaryActionText}>Go to My Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.outlineLogoutButton}
                  onPress={async () => {
                    await logout();
                  }}
                >
                  <Text style={styles.outlineLogoutText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.authButtonsRow}>
              <TouchableOpacity
                style={styles.loginHeroBtn}
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.85}
              >
                <Text style={styles.loginHeroBtnText}>Login to Portal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerHeroBtn}
                onPress={() => router.push('/(auth)/register')}
                activeOpacity={0.85}
              >
                <Text style={styles.registerHeroBtnText}>Register Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Emergency Contact Banner */}
        <View style={styles.emergencyBanner}>
          <Text style={styles.emergencyIcon}>🚑</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.emergencyTitle}>Emergency Ambulance Hotline</Text>
            <Text style={styles.emergencyNumber}>+880 1700 000000 (Hotline: 10666)</Text>
          </View>
        </View>

        {/* Hospital Core Services */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hospital Services</Text>
          <Text style={styles.sectionSubtitle}>Integrated healthcare facilities</Text>
        </View>

        <View style={styles.servicesGrid}>
          <TouchableOpacity
            style={styles.serviceCard}
            onPress={() => (!isAuthenticated ? router.push('/(auth)/login') : null)}
          >
            <View style={[styles.serviceIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Text style={styles.serviceIcon}>🩺</Text>
            </View>
            <Text style={styles.serviceCardTitle}>Doctor Appointments</Text>
            <Text style={styles.serviceCardDesc}>
              Book expert consultations across 15+ specialized medical departments.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.serviceCard}
            onPress={() => (!isAuthenticated ? router.push('/(auth)/login') : null)}
          >
            <View style={[styles.serviceIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Text style={styles.serviceIcon}>🔬</Text>
            </View>
            <Text style={styles.serviceCardTitle}>Lab & Diagnostics</Text>
            <Text style={styles.serviceCardDesc}>
              High-precision pathology, blood tests, radiology, and online test reports.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.serviceCard}
            onPress={() => (!isAuthenticated ? router.push('/(auth)/login') : null)}
          >
            <View style={[styles.serviceIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.serviceIcon}>🛏️</Text>
            </View>
            <Text style={styles.serviceCardTitle}>Wards & ICU Beds</Text>
            <Text style={styles.serviceCardDesc}>
              Emergency admissions, ICU, CCU, and general bed occupancy tracking.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.serviceCard}
            onPress={() => (!isAuthenticated ? router.push('/(auth)/login') : null)}
          >
            <View style={[styles.serviceIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Text style={styles.serviceIcon}>💊</Text>
            </View>
            <Text style={styles.serviceCardTitle}>24/7 Pharmacy</Text>
            <Text style={styles.serviceCardDesc}>
              Genuine medicines, prescription fulfillment, and inventory management.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hospital Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Specialist Doctors</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>120+</Text>
            <Text style={styles.statLabel}>Hospital Beds</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Emergency Care</Text>
          </View>
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>🏥 MediCare General Hospital</Text>
          <Text style={styles.footerText}>
            Medical College Road, Dhaka, Bangladesh{'\n'}
            Visiting Hours: Daily 10:00 AM – 08:00 PM
          </Text>
          <Text style={styles.footerCopyright}>
            © 2026 MediCare Hospital Management System. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoIcon: {
    fontSize: 22,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  navLoginBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navLoginText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  navLogoutBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navLogoutText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 13,
  },
  heroBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  heroBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  heroHeadline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 32,
    marginBottom: 10,
  },
  heroDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
    marginBottom: 22,
  },
  authButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  loginHeroBtn: {
    flex: 1,
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginHeroBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  registerHeroBtn: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  registerHeroBtnText: {
    color: '#0284C7',
    fontSize: 15,
    fontWeight: '700',
  },
  loggedInCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  welcomeLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  rolePillText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '700',
  },
  userActions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryActionButton: {
    flex: 2,
    backgroundColor: '#0284C7',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  outlineLogoutButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  outlineLogoutText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 13,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  emergencyIcon: {
    fontSize: 28,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B91C1C',
  },
  emergencyNumber: {
    fontSize: 13,
    color: '#991B1B',
    marginTop: 2,
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  serviceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIcon: {
    fontSize: 22,
  },
  serviceCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  serviceCardDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  statsContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 28,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#38BDF8',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#334155',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerBrand: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
  },
  footerCopyright: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
