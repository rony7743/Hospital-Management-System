import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { pharmacyApi, MedicineItem } from '../../services/api';


export default function PharmacyScreen() {
  const router = useRouter();
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const [catRes, medRes] = await Promise.all([
        pharmacyApi.getCategories(),
        pharmacyApi.getMedicines(),
      ]);
      setCategories(catRes.categories || []);
      setMedicines(medRes.medicines || []);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load pharmacy medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterCategory = async (cat: string | null) => {
    setSelectedCategory(cat);
    try {
      setLoading(true);
      const res = await pharmacyApi.getMedicines({
        category: cat || undefined,
        search: search || undefined,
      });
      setMedicines(res.medicines || []);
    } catch (e: any) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text: string) => {
    setSearch(text);
    try {
      const res = await pharmacyApi.getMedicines({
        category: selectedCategory || undefined,
        search: text || undefined,
      });
      setMedicines(res.medicines || []);
    } catch (e: any) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hospital Pharmacy</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search medicine brand or generic name..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* Category Chips */}
      <View style={styles.chipsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
          <TouchableOpacity
            style={[styles.chip, !selectedCategory && styles.chipActive]}
            onPress={() => handleFilterCategory(null)}
          >
            <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>All Forms</Text>
          </TouchableOpacity>
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, selectedCategory === c && styles.chipActive]}
              onPress={() => handleFilterCategory(c)}
            >
              <Text style={[styles.chipText, selectedCategory === c && styles.chipTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Medicines List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Loading medicines catalog...</Text>
        </View>
      ) : (
        <FlatList
          data={medicines}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.medCard}>
              <View style={styles.medTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.medName}>{item.name}</Text>
                  <Text style={styles.genericName}>{item.genericName}</Text>
                  <Text style={styles.mfgText}>By {item.manufacturer || 'General Pharma'}</Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>৳ {Number(item.unitPrice).toFixed(2)}</Text>
                  <Text style={styles.perUnit}>per unit</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.medBottom}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{item.category}</Text>
                </View>

                <View style={styles.stockBadge}>
                  <Text style={styles.stockText}>
                    {item.stockQuantity > 0 ? `In Stock (${item.stockQuantity})` : 'Out of Stock'}
                  </Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No medicines found matching your search.</Text>
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
  medCard: {
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
  medTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  medName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  genericName: { fontSize: 13, color: '#0284C7', marginTop: 2 },
  mfgText: { fontSize: 12, color: '#94A3B8', marginTop: 3 },
  priceContainer: { alignItems: 'flex-end', marginLeft: 8 },
  priceText: { fontSize: 18, fontWeight: '800', color: '#059669' },
  perUnit: { fontSize: 11, color: '#94A3B8' },
  cardDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  medBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  stockBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockText: { fontSize: 11, fontWeight: '700', color: '#166534' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748B' },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#94A3B8', fontSize: 14 },
});

