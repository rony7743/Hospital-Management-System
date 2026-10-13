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
import { doctorApi, appointmentApi, Doctor } from '../../services/api';
import { useAuth } from '../../context/AuthContext';


export default function DoctorsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [patientName, setPatientName] = useState(user?.fullName || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [appointmentDate, setAppointmentDate] = useState('2026-10-15');
  const [timeSlot, setTimeSlot] = useState('10:30 AM');
  const [reason, setReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [deptRes, docRes] = await Promise.all([
        doctorApi.getDepartments(),
        doctorApi.getDoctors(),
      ]);
      setDepartments(deptRes.departments || []);
      setDoctors(docRes.doctors || []);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (deptId: string | null) => {
    setSelectedDept(deptId);
    try {
      setLoading(true);
      const res = await doctorApi.getDoctors({
        departmentId: deptId || undefined,
        search: searchQuery || undefined,
      });
      setDoctors(res.doctors || []);
    } catch (e: any) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    try {
      const res = await doctorApi.getDoctors({
        departmentId: selectedDept || undefined,
        search: text || undefined,
      });
      setDoctors(res.doctors || []);
    } catch (e: any) {
      console.log(e);
    }
  };

  const openBookingModal = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setPatientName(user?.fullName || '');
    setPatientPhone(user?.phone || '');
    setReason('');
    setModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor) return;
    if (!patientName.trim() || !patientPhone.trim()) {
      Alert.alert('Required', 'Please enter your name and phone number');
      return;
    }

    try {
      setBookingLoading(true);
      const res = await appointmentApi.bookAppointment({
        doctorId: selectedDoctor.id,
        appointmentDate,
        timeSlot,
        reason: reason.trim() || 'General Consultation',
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
      });

      setModalVisible(false);
      Alert.alert(
        'Appointment Confirmed! 🎉',
        `Serial No: #${res.appointment.serialNumber}\nDoctor: Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}\nDate: ${appointmentDate} (${timeSlot})`
      );
    } catch (err: any) {
      Alert.alert('Booking Error', err.message || 'Failed to book appointment');
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
        <Text style={styles.headerTitle}>Find Doctors</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by doctor name or specialization..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Department Filter Chips */}
      <View style={styles.chipsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
          <TouchableOpacity
            style={[styles.chip, !selectedDept && styles.chipActive]}
            onPress={() => handleFilter(null)}
          >
            <Text style={[styles.chipText, !selectedDept && styles.chipTextActive]}>All Specialities</Text>
          </TouchableOpacity>
          {departments.map((dept) => (
            <TouchableOpacity
              key={dept.id}
              style={[styles.chip, selectedDept === dept.id && styles.chipActive]}
              onPress={() => handleFilter(dept.id)}
            >
              <Text style={[styles.chipText, selectedDept === dept.id && styles.chipTextActive]}>
                {dept.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Doctor List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Loading doctors...</Text>
        </View>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.doctorCard}>
              <View style={styles.docHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.firstName.replace('Dr. ', '').charAt(0)}
                  </Text>
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docName}>{item.firstName} {item.lastName}</Text>
                  <Text style={styles.docSpec}>{item.specialization}</Text>
                  <Text style={styles.docQual}>{item.qualifications}</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.detailsRow}>
                <View>
                  <Text style={styles.detailLabel}>Department</Text>
                  <Text style={styles.detailValue}>{item.department?.name || 'General'}</Text>
                </View>
                <View>
                  <Text style={styles.detailLabel}>Consultation Fee</Text>
                  <Text style={styles.feeValue}>৳ {Number(item.consultationFee)}</Text>
                </View>
                <View>
                  <Text style={styles.detailLabel}>Room</Text>
                  <Text style={styles.detailValue}>{item.roomNumber || 'Room 101'}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.bookBtn}
                onPress={() => openBookingModal(item)}
              >
                <Text style={styles.bookBtnText}>Book Appointment</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No doctors found for this category.</Text>
            </View>
          }
        />
      )}

      {/* Booking Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Book Consultation</Text>
            {selectedDoctor && (
              <Text style={styles.modalDoctorName}>
                Dr. {selectedDoctor.firstName} {selectedDoctor.lastName} ({selectedDoctor.specialization})
              </Text>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Patient Full Name</Text>
              <TextInput
                style={styles.modalInput}
                value={patientName}
                onChangeText={setPatientName}
                placeholder="Rahim Uddin"
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                value={patientPhone}
                onChangeText={setPatientPhone}
                placeholder="+8801700000000"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Appointment Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.modalInput}
                value={appointmentDate}
                onChangeText={setAppointmentDate}
                placeholder="2026-10-15"
              />

              <Text style={styles.inputLabel}>Preferred Time Slot</Text>
              <View style={styles.slotRow}>
                {['10:00 AM', '11:30 AM', '04:00 PM', '06:00 PM'].map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.slotChip, timeSlot === slot && styles.slotChipActive]}
                    onPress={() => setTimeSlot(slot)}
                  >
                    <Text style={[styles.slotText, timeSlot === slot && styles.slotTextActive]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Reason / Symptoms (Optional)</Text>
              <TextInput
                style={styles.modalInput}
                value={reason}
                onChangeText={setReason}
                placeholder="Chest discomfort, fever, routine checkup..."
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleConfirmBooking}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.confirmBtnText}>Confirm Booking</Text>
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
  searchBox: { paddingHorizontal: 16, paddingTop: 12 },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  chipsWrapper: { paddingVertical: 10 },
  chipsContainer: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  chipText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  docHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: '#0284C7' },
  docInfo: { marginLeft: 14, flex: 1 },
  docName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  docSpec: { fontSize: 13, color: '#0284C7', fontWeight: '600', marginTop: 2 },
  docQual: { fontSize: 12, color: '#64748B', marginTop: 2 },
  cardDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  detailLabel: { fontSize: 11, color: '#94A3B8' },
  detailValue: { fontSize: 13, fontWeight: '600', color: '#334155', marginTop: 2 },
  feeValue: { fontSize: 14, fontWeight: '700', color: '#059669', marginTop: 2 },
  bookBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748B' },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#94A3B8', fontSize: 14 },
  // Modal styles
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
    maxHeight: '85%',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  modalDoctorName: { fontSize: 13, color: '#0284C7', fontWeight: '600', marginBottom: 16 },
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
  slotRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 6 },
  slotChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  slotChipActive: { borderColor: '#0284C7', backgroundColor: '#E0F2FE' },
  slotText: { fontSize: 12, color: '#64748B' },
  slotTextActive: { color: '#0284C7', fontWeight: '700' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 12 },
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

