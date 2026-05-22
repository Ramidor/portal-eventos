import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { CATEGORY_LABELS } from '@/constants/categories';
import api from '@/services/api';

type EventItem = { id: number; title: string; date: string; location: string; category: string; _count: { enrollments: number } };
type Rating    = { id: number; score: number; comment: string | null; rater: { name: string }; event: { id: number; title: string } };

type ProfileData = {
  user: { id: number; name: string; createdAt: string };
  events: EventItem[];
  ratingSummary: { average: number | null; total: number };
  ratings: Rating[];
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData]       = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get(`/users/${id}/public`)
      .then(({ data }) => setData(data))
      .catch(() => setError('Usuario no encontrado'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color={Colors.accent} size="large" />
    </View>
  );

  if (error || !data) return (
    <View style={styles.center}>
      <Text style={{ color: Colors.error }}>{error || 'Usuario no encontrado'}</Text>
    </View>
  );

  const { user, events, ratingSummary, ratings } = data;
  const futureEvents = events.filter((e) => new Date(e.date) >= new Date());
  const pastEvents   = events.filter((e) => new Date(e.date) < new Date());

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Cabecera */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ORGANIZADOR</Text>
          <Text style={styles.name}>{user.name}</Text>
          {ratingSummary.average !== null && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingBadgeStar}>★</Text>
              <Text style={styles.ratingBadgeValue}>{ratingSummary.average}</Text>
              <Text style={styles.ratingBadgeCount}>({ratingSummary.total} valoraciones)</Text>
            </View>
          )}
          <Text style={styles.eventCount}>
            {events.length} evento{events.length !== 1 ? 's' : ''} organizado{events.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Próximos eventos */}
        {futureEvents.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>PRÓXIMOS EVENTOS ({futureEvents.length})</Text>
            {futureEvents.map((e) => <EventRow key={e.id} event={e} />)}
          </View>
        )}

        {/* Eventos pasados */}
        {pastEvents.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>EVENTOS PASADOS ({pastEvents.length})</Text>
            {pastEvents.map((e) => <EventRow key={e.id} event={e} past />)}
          </View>
        )}

        {/* Valoraciones */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>VALORACIONES</Text>
          {ratings.length === 0 ? (
            <Text style={styles.empty}>Sin valoraciones todavía.</Text>
          ) : (
            ratings.map((r) => (
              <View key={r.id} style={styles.ratingRow}>
                <View style={styles.ratingHeader}>
                  <Text style={styles.raterName}>{r.rater.name}</Text>
                  <Text style={styles.stars}>{'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}</Text>
                </View>
                {r.comment ? <Text style={styles.ratingComment}>{r.comment}</Text> : null}
                <Pressable onPress={() => router.push(`/events/${r.event.id}` as never)}>
                  <Text style={styles.ratingEventLink}>{r.event.title}</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function EventRow({ event, past = false }: { event: EventItem; past?: boolean }) {
  const date = new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <Pressable style={styles.eventRow} onPress={() => router.push(`/events/${event.id}` as never)}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.eventTitle, past && styles.eventTitlePast]} numberOfLines={1}>{event.title}</Text>
        <Text style={styles.eventMeta}>{CATEGORY_LABELS[event.category] || '📌 Otro'} · {date}</Text>
      </View>
      <Text style={styles.enrollments}>{event._count.enrollments} inscritos</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.bg },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  scroll:       { padding: 20, gap: 16, paddingBottom: 40 },
  header:       { gap: 6 },
  eyebrow:      { color: Colors.textMuted, fontSize: 11, letterSpacing: 3 },
  name:         { color: Colors.textPrimary, fontSize: 30, fontWeight: '700' },
  ratingBadge:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginTop: 4 },
  ratingBadgeStar: { color: Colors.accent, fontSize: 16 },
  ratingBadgeValue:{ color: Colors.textPrimary, fontWeight: '700', fontSize: 16 },
  ratingBadgeCount:{ color: Colors.textMuted, fontSize: 13 },
  eventCount:   { color: Colors.textMuted, fontSize: 13, marginTop: 4 },
  card:         { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 16, gap: 12 },
  sectionTitle: { color: Colors.textMuted, fontSize: 11, letterSpacing: 2 },
  empty:        { color: Colors.textMuted, fontSize: 14 },
  eventRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, borderTopWidth: 1, borderTopColor: Colors.border },
  eventTitle:   { color: Colors.textPrimary, fontSize: 14, fontWeight: '500' },
  eventTitlePast: { color: Colors.textMuted },
  eventMeta:    { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  enrollments:  { color: Colors.textMuted, fontSize: 12, flexShrink: 0 },
  ratingRow:    { gap: 4, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10 },
  ratingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  raterName:    { color: Colors.textPrimary, fontSize: 14, fontWeight: '500' },
  stars:        { color: Colors.accent, fontSize: 13 },
  ratingComment:{ color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  ratingEventLink: { color: Colors.textMuted, fontSize: 12, marginTop: 2, textDecorationLine: 'underline' },
});
