import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { wardApi, WardItem } from '../../services/api';


export default function WardsBedsScreen() {
  const router = useRouter();
  const [wards, setWards] = useState<WardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWards();
  }, []);

  const fetchWards = async () => {
    try {
      setLoading(true);
      const res = await wardApi.getWards();
      setWards(res.wards || []);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to fetch ward bed occupancy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wards & Bed Tracker</Text>
        <TouchableOpacity onPress={fetchWards} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Admission Banner */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🏥 Emergency Admission Desk</Text>
        <Text style={styles.infoText}>
          Real-time bed availability for General Ward, ICU, and CCU. For emergency patient transfers, contact our desk at +880 1700 000000.
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Loading bed availability...</Text>
        </View>
      ) : (
        <FlatList
          data={wards}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.wardCard}>
              <View style={styles.wardHeader}>
                <View>
                  <Text style={styles.wardName}>{item.name}</Text>
                  <Text style={styles.wardType}>
                    Type: {item.type} • Floor: Level {item.floorNumber}
                  </Text>
                </View>
                <View style={styles.statsPill}>
                  <Text style={styles.statsPillText}>
                    {item.availableBeds} Available
                  </Text>
                </View>
              </View>

              <View style={styles.summaryBar}>
                <Text style={styles.summaryText}>
                  Total Beds: <Text style={styles.bold}>{item.totalBeds}</Text>
                </Text>
                <Text style={styles.summaryText}>
                  Occupied: <Text style={styles.occupiedText}>{item.occupiedBeds}</Text>
                </Text>
              </View>

              {/* Beds Grid */}
              <Text style={styles.bedsGridTitle}>Beds Status:</Text>
              <View style={styles.bedsGrid}>
                {item.beds && item.beds.length > 0 ? (
                  item.beds.map((bed) => (
                    <View
                      key={bed.id}
                      style={[
                        styles.bedBox,
                        bed.isOccupied ? styles.bedOccupied : styles.bedAvailable,
                      ]}
                    >
                      <Text
                        style={[
                          styles.bedNumber,
                          bed.isOccupied ? styles.textOccupied : styles.textAvailable,
                        ]}
                      >
                        {bed.bedNumber}
                      </Text>
                      <Text style={styles.bedStatusText}>
                        {bed.isOccupied ? 'Occupied' : 'Vacant'}
                      </Text>
                      <Text style={styles.bedCharge}>৳ {Number(bed.dailyCharge)}/day</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noBeds}>No beds assigned yet</Text>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No wards found.</Text>
            </View>
          }
        />
      )}
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
  refreshBtn: { padding: 6 },
  refreshText: { fontSize: 16 },
  infoCard: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 14,
    margin: 16,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#0369A1', marginBottom: 4 },
  infoText: { fontSize: 12, color: '#0C4A6E', lineHeight: 18 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  wardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  wardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  wardName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  wardType: { fontSize: 12, color: '#64748B', marginTop: 2 },
  statsPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statsPillText: { color: '#15803D', fontWeight: '700', fontSize: 12 },
  summaryBar: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  summaryText: { fontSize: 12, color: '#64748B' },
  bold: { fontWeight: '700', color: '#0F172A' },
  occupiedText: { fontWeight: '700', color: '#DC2626' },
  bedsGridTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginTop: 12, marginBottom: 8 },
  bedsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bedBox: {
    width: '47%',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  bedAvailable: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  bedOccupied: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  bedNumber: { fontSize: 14, fontWeight: '700' },
  textAvailable: { color: '#166534' },
  textOccupied: { color: '#991B1B' },
  bedStatusText: { fontSize: 11, color: '#64748B', marginTop: 2 },
  bedCharge: { fontSize: 11, fontWeight: '600', color: '#0284C7', marginTop: 4 },
  noBeds: { color: '#94A3B8', fontSize: 12 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748B' },
  emptyContainer: { alignItems: 'center', marginTop: 30 },
  emptyText: { color: '#94A3B8', fontSize: 14 },
});

