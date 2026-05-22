import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { CATEGORY_LABELS, CATEGORIES } from '@/constants/categories';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

type Event = {
  id: number;
  title: string;
  date: string;
  location: string;
  category: string;
  images: string[];
  maxAttendees: number | null;
  creator: { name: string };
  _count: { enrollments: number };
};

export default function EventsScreen() {
  const { user } = useAuth();
  const [events, setEvents]     = useState<Event[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)   params.append('search', search);
    if (category) params.append('category', category);
    params.append('limit', '20');

    api.get(`/events?${params}`)
      .then(({ data }) => setEvents(data.events))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>PRÓXIMOS EVENTOS</Text>
          <Text style={styles.title}>Descubre qué{'\n'}está pasando</Text>
        </View>
        <Pressable style={styles.createBtn} onPress={() => router.push('/events/new')}>
          <Text style={styles.createBtnText}>+ Crear</Text>
        </Pressable>
      </View>

      {/* Búsqueda */}
      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar eventos..."
        placeholderTextColor={Colors.textMuted}
      />

      {/* Filtro categoría */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {[{ value: '', label: 'Todas' }, ...CATEGORIES].map((item) => (
          <Pressable
            key={item.value}
            style={[styles.chip, category === item.value && styles.chipActive]}
            onPress={() => { setCategory(item.value); }}
          >
            <Text style={[styles.chipText, category === item.value && styles.chipTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Lista */}
      {loading ? (
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(e) => String(e.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No hay eventos que coincidan.</Text>}
          renderItem={({ item }) => <EventCard event={item} />}
        />
      )}
    </SafeAreaView>
  );
}

function EventCard({ event }: { event: Event }) {
  const date = new Date(event.date);
  const day   = date.toLocaleDateString('es-ES', { day: '2-digit' });
  const month = date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
  const time  = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/events/${event.id}`)}>
      <View style={styles.cardDate}>
        <Text style={styles.cardMonth}>{month}</Text>
        <Text style={styles.cardDay}>{day}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>
        <Text style={styles.cardMeta}>{time} · {event.location}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardCategory}>{CATEGORY_LABELS[event.category] ?? '📌 Otro'}</Text>
          <Text style={styles.cardEnrollments}>{event._count.enrollments} inscritos</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  eyebrow:{ color: Colors.textMuted, fontSize: 11, letterSpacing: 3 },
  title:  { color: Colors.textPrimary, fontSize: 26, fontWeight: '700', marginTop: 4 },
  createBtn: { backgroundColor: Colors.accent, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  createBtnText: { color: Colors.accentDark, fontWeight: '700', fontSize: 13 },
  search: {
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    color: Colors.textPrimary, fontSize: 14,
  },
  chips:   { flexDirection: 'row', paddingHorizontal: 20, paddingRight: 20, gap: 8, marginBottom: 14 },
  chip:    { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText:   { color: Colors.textSecondary, fontSize: 13 },
  chipTextActive: { color: Colors.accentDark, fontWeight: '600' },
  list:  { paddingHorizontal: 20, gap: 12, paddingBottom: 20, flexGrow: 1 },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, padding: 16, flexDirection: 'row', gap: 14,
  },
  cardDate:  { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, minWidth: 52 },
  cardMonth: { color: Colors.accent, fontSize: 11, fontWeight: '600' },
  cardDay:   { color: Colors.textPrimary, fontSize: 24, fontWeight: '700' },
  cardBody:  { flex: 1, gap: 4 },
  cardTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  cardMeta:  { color: Colors.textMuted, fontSize: 12 },
  cardFooter:{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  cardCategory:    { color: Colors.textSecondary, fontSize: 12 },
  cardEnrollments: { color: Colors.textMuted, fontSize: 12 },
});
