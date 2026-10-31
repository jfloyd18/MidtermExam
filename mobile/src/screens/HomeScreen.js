import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getStudents } from '../api/studentApi';
import WeatherCard from '../components/WeatherCard';
import { Button, Header } from '../components/ui';
import { colors } from '../theme';

const initials = (s) => `${s.first_name?.[0] || ''}${s.last_name?.[0] || ''}`.toUpperCase();

// READ: lists all students from the custom API + the weather widget
export default function HomeScreen({ reloadKey, onOpenStudent, onAdd }) {
  const insets = useSafeAreaInsets();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      setStudents(await getStudents());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload whenever we come back from a create / update / delete
  useEffect(() => {
    load();
  }, [load, reloadKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      `${s.first_name} ${s.last_name} ${s.student_number} ${s.course}`.toLowerCase().includes(q)
    );
  }, [students, query]);

  const listHeader = (
    <>
      <WeatherCard />
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Students</Text>
        {!loading && !error ? (
          <View style={styles.countPill}>
            <Text style={styles.countText}>{students.length}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.filterBox}>
        <Ionicons name="filter" size={18} color={colors.muted} />
        <TextInput
          style={styles.filterInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Filter by name, ID or course"
          placeholderTextColor={colors.muted}
        />
      </View>
    </>
  );

  const emptyState = loading ? (
    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
  ) : error ? (
    <View style={styles.center}>
      <Ionicons name="cloud-offline" size={48} color={colors.danger} />
      <Text style={styles.errorText}>{error}</Text>
      <Button title="Try again" icon="refresh" onPress={() => load()} />
    </View>
  ) : (
    <Text style={styles.emptyText}>No students yet. Tap "Add Student".</Text>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Student Records"
        right={
          <Pressable onPress={() => load()} hitSlop={12}>
            <Ionicons name="sync" size={22} color={colors.white} />
          </Pressable>
        }
      />

      <FlatList
        data={loading || error ? [] : filtered}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyState}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onOpenStudent(item)}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(item)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {item.first_name} {item.last_name}
              </Text>
              <Text style={styles.meta}>
                {item.student_number} · {item.course} · Year {item.year_level}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        )}
      />

      <Pressable
        onPress={onAdd}
        style={({ pressed }) => [styles.fab, { bottom: insets.bottom + 20 }, pressed && { opacity: 0.85 }]}
      >
        <Ionicons name="person-add" size={20} color={colors.white} />
        <Text style={styles.fabText}>Add Student</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 10, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  countPill: { backgroundColor: colors.primaryLight, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2 },
  countText: { color: colors.primary, fontWeight: '700' },
  filterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
  },
  filterInput: { flex: 1, paddingVertical: 10, fontSize: 15, color: colors.text },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 5,
    padding: 14,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  center: { alignItems: 'center', padding: 24, gap: 12 },
  errorText: { textAlign: 'center', color: colors.text },
  emptyText: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  fab: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 28,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
