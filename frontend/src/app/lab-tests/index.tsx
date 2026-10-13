import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { labTestApi, LabCatalogItem } from '../../services/api';
import { useAuth } from '../../context/AuthContext';


export default function LabTestsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [catalog, setCatalog] = useState<LabCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Booking modal state
  const [selectedTest, setSelectedTest] = useState<LabCatalogItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [patientName, setPatientName] = useState(user?.fullName || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await labTestApi.getCatalog();
      setCatalog(res.catalog || []);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to fetch lab tests');
    } finally {
      setLoading(false);
    }
  };

  const filteredCatalog = catalog.filter((t) =>
    t.testName.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const openBookModal = (test: LabCatalogItem) => {
    setSelectedTest(test);
    setPatientName(user?.fullName || '');
    setPatientPhone(user?.phone || '');
    setModalVisible(true);
  };

  const handleConfirmBook = async () => {
    if (!selectedTest) return;
    if (!patientName.trim() || !patientPhone.trim()) {
      Alert.alert('Required', 'Please enter your name and phone number');
      return;
    }

    try {
      setBookingLoading(true);
      await labTestApi.bookLabTest({
        testName: selectedTest.testName,
        category: selectedTest.category,
        cost: selectedTest.cost,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
      });

      setModalVisible(false);
      Alert.alert(
        'Diagnostic Test Booked! 🔬',
        `Test: ${selectedTest.testName}\nEstimated Cost: ৳ ${selectedTest.cost}\nTurnaround: ${selectedTest.turnaround}\nPlease visit the hospital lab counter with your phone number.`
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to book test');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lab & Diagnostics</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search test name (e.g. CBC, ECG, Lipid Profile)..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Loading diagnostic catalog...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCatalog}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.testCard}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.testName}>{item.testName}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    <Text style={styles.turnaroundText}>⏱️ {item.turnaround}</Text>
                  </View>
                </View>

                <View style={styles.priceBox}>
                  <Text style={styles.priceText}>৳ {item.cost}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.bookBtn}
                onPress={() => openBookModal(item)}
              >
                <Text style={styles.bookBtnText}>Book Diagnostic Test</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Booking Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Book Lab Test</Text>
            {selectedTest && (
              <Text style={styles.modalSub}>
                {selectedTest.testName} (Fee: ৳{selectedTest.cost})
              </Text>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Patient Full Name</Text>
              <TextInput
                style={styles.modalInput}
                value={patientName}
                onChangeText={setPatientName}
                placeholder="Full Name"
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                value={patientPhone}
                onChangeText={setPatientPhone}
                placeholder="+880 1700 000000"
                keyboardType="phone-pad"
              />

              <View style={styles.infoBanner}>
                <Text style={styles.infoBannerText}>
                  💡 Sampling is conducted at Hospital Diagnostic Wing (Level 2). Fasting tests require an 8-hour overnight fast.
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleConfirmBook}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.confirmBtnText}>Confirm Test</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { padding: 6 },
  backBtnText: { color: '#0284C7', fontWeight: '600', fontSize: 15 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  searchBox: { paddingHorizontal: 16, paddingVertical: 12 },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  testName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  categoryBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: { color: '#0284C7', fontSize: 11, fontWeight: '700' },
  turnaroundText: { fontSize: 12, color: '#64748B' },
  priceBox: { alignItems: 'flex-end', marginLeft: 10 },
  priceText: { fontSize: 18, fontWeight: '800', color: '#059669' },
  bookBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 14,
  },
  bookBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748B' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  modalSub: { fontSize: 13, color: '#0284C7', fontWeight: '600', marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#334155', marginTop: 10, marginBottom: 4 },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  infoBanner: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoBannerText: { fontSize: 12, color: '#92400E', lineHeight: 18 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  cancelBtnText: { color: '#64748B', fontWeight: '600' },
  confirmBtn: {
    flex: 2,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#FFFFFF', fontWeight: '700' },
});

