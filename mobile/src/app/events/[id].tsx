import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Linking,
  Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';
import useWall from '@/hooks/useWall';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/constants/categories';
import { Tag, Clock, MapPin } from 'lucide-react-native';
import api from '@/services/api';

type Event = {
  id: number;
  title: string;
  description: string | null;
  date: string;
  location: string;
  images: string[];
  category: string;
  latitude: number | null;
  longitude: number | null;
  maxAttendees: number | null;
  creatorId: number;
  creator: { id: number; name: string };
  creatorRating?: { average: number | null; total: number };
  _count: { enrollments: number };
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { width: screenWidth } = useWindowDimensions();

  const [event, setEvent]           = useState<Event | null>(null);
  const [loading, setLoading]       = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling]   = useState(false);
  const [imgIndex, setImgIndex]     = useState(0);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
    if (viewableItems[0]?.index != null) setImgIndex(viewableItems[0].index);
  });

  const isCreator = user && event && user.id === event.creatorId;
  const isPast    = event ? new Date(event.date) < new Date() : false;
  const enrolledCount = event?._count.enrollments ?? 0;
  const spotsLeft     = event?.maxAttendees != null ? event.maxAttendees - enrolledCount : null;
  const isFull        = spotsLeft !== null && spotsLeft <= 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, meRes] = await Promise.allSettled([
          api.get(`/events/${id}`),
          user ? api.get(`/events/${id}/enrollments/me`) : Promise.resolve({ data: { isEnrolled: false } }),
        ]);
        if (eventRes.status === 'fulfilled') setEvent(eventRes.value.data);
        if (meRes.status === 'fulfilled')    setIsEnrolled(meRes.value.data.isEnrolled);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) { router.push('/login'); return; }
    setEnrolling(true);
    try {
      await api.post(`/events/${id}/enroll`);
      setIsEnrolled(true);
      setEvent((prev) => prev ? { ...prev, _count: { enrollments: prev._count.enrollments + 1 } } : prev);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Error al inscribirse');
    } finally { setEnrolling(false); }
  };

  const handleUnenroll = async () => {
    Alert.alert('Cancelar inscripción', '¿Seguro que quieres cancelar tu inscripción?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar', style: 'destructive',
        onPress: async () => {
          setEnrolling(true);
          try {
            await api.delete(`/events/${id}/enroll`);
            setIsEnrolled(false);
            setEvent((prev) => prev ? { ...prev, _count: { enrollments: prev._count.enrollments - 1 } } : prev);
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.error || 'Error al cancelar');
          } finally { setEnrolling(false); }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Eliminar evento', '¿Seguro que quieres eliminar este evento?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/events/${id}`);
            router.replace('/(tabs)');
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.error || 'Error al eliminar');
          }
        },
      },
    ]);
  };

  const { token } = useAuth();
  const { messages, connected, error: wallError, sendMessage } = useWall(Number(id), isEnrolled || isCreator ? token : null);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color={Colors.accent} size="large" />
    </View>
  );

  if (!event) return (
    <View style={styles.center}>
      <Text style={{ color: Colors.error }}>Evento no encontrado</Text>
    </View>
  );

  const date = new Date(event.date);
  const formattedDate = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Galería de imágenes */}
        {event.images.length > 0 && (
          <View>
            <FlatList
              data={event.images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              viewabilityConfig={viewabilityConfig.current}
              onViewableItemsChanged={onViewableItemsChanged.current}
              renderItem={({ item }) => (
                <View style={{ width: screenWidth, height: 240, backgroundColor: Colors.surface }}>
                  <Image source={{ uri: item }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover" blurRadius={18} />
                  <Image source={{ uri: item }}
                    style={{ width: screenWidth, height: 240 }}
                    resizeMode="contain" />
                </View>
              )}
            />
            {event.images.length > 1 && (
              <View style={styles.dots}>
                {event.images.map((_, i) => (
                  <View key={i} style={[styles.dot, i === imgIndex && styles.dotActive]} />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.content}>
          {/* Cabecera */}
          <View style={styles.meta}>
            {(() => { const Icon = CATEGORY_ICONS[event.category] ?? Tag; return (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Icon size={13} color={Colors.textSecondary} />
                <Text style={styles.category}>{CATEGORY_LABELS[event.category] ?? 'Otro'}</Text>
              </View>
            ); })()}
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
          <Text style={styles.title}>{event.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
              <Clock size={13} color={Colors.textMuted} />
              <Text style={styles.sub}>{formattedTime}</Text>
              <Text style={styles.sub}>·</Text>
              <MapPin size={13} color={Colors.textMuted} />
              <Text style={styles.sub} numberOfLines={1}>{event.location}</Text>
            </View>
            {event.latitude && event.longitude && (
              <Pressable
                onPress={() => Linking.openURL(`https://maps.google.com/?q=${event.latitude},${event.longitude}`)}
                style={styles.mapsBtn}
              >
                <Text style={styles.mapsBtnText}>Ver mapa</Text>
              </Pressable>
            )}
          </View>
          <Pressable onPress={() => router.push(`/users/${event.creator.id}` as never)} style={styles.creatorRow}>
            <Text style={styles.creator}>
              Por{' '}
              <Text style={styles.creatorName}>{event.creator.name}</Text>
              {event.creatorRating?.average !== null && event.creatorRating?.average !== undefined && (
                <Text style={styles.creatorRating}>  ★ {event.creatorRating.average} <Text style={styles.creatorRatingCount}>({event.creatorRating.total})</Text></Text>
              )}
            </Text>
          </Pressable>

          {/* Aforo */}
          {event.maxAttendees !== null && (
            <View style={styles.capacityBox}>
              <View style={styles.capacityRow}>
                <Text style={styles.capacityLabel}>Aforo</Text>
                <Text style={styles.capacityCount}>{enrolledCount} / {event.maxAttendees}</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[
                  styles.progressFill,
                  { width: `${Math.min(100, (enrolledCount / event.maxAttendees) * 100)}%` as any,
                    backgroundColor: isFull ? Colors.error : Colors.accent },
                ]} />
              </View>
              <Text style={{ color: isFull ? Colors.error : Colors.textMuted, fontSize: 12, marginTop: 4 }}>
                {isFull ? 'Aforo completo' : `${spotsLeft} plazas libres`}
              </Text>
            </View>
          )}

          {/* Descripción */}
          {event.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DESCRIPCIÓN</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          {/* Inscritos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INSCRITOS</Text>
            <Text style={styles.enrolledCount}>{enrolledCount} {enrolledCount === 1 ? 'persona apuntada' : 'personas apuntadas'}</Text>
          </View>

          {/* Muro en tiempo real */}
          {(isEnrolled || isCreator) && <Wall messages={messages} connected={connected} wallError={wallError} onSend={sendMessage} userId={user?.id ?? 0} />}

          {/* Valoraciones */}
          {isPast && <RatingsSection eventId={Number(id)} userId={user?.id ?? 0} isCreator={!!isCreator} isEnrolled={isEnrolled} />}
        </View>
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.actions}>
        {isCreator ? (
          <>
            <Pressable style={styles.editBtn} onPress={() => router.push(`/events/${id}/edit` as any)}>
              <Text style={styles.editBtnText}>Editar</Text>
            </Pressable>
            <Pressable style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>Eliminar</Text>
            </Pressable>
          </>
        ) : !isPast && (
          isEnrolled ? (
            <Pressable style={styles.unenrollBtn} onPress={handleUnenroll} disabled={enrolling}>
              <Text style={styles.unenrollBtnText}>{enrolling ? '...' : 'Cancelar inscripción'}</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.enrollBtn, (isFull || enrolling) && styles.btnDisabled]}
              onPress={handleEnroll}
              disabled={isFull || enrolling}
            >
              <Text style={styles.enrollBtnText}>
                {enrolling ? '...' : isFull ? 'Aforo completo' : 'Inscribirse'}
              </Text>
            </Pressable>
          )
        )}
      </View>
    </SafeAreaView>
  );
}

function RatingsSection({ eventId, userId, isCreator, isEnrolled }: {
  eventId: number; userId: number; isCreator: boolean; isEnrolled: boolean;
}) {
  const [ratings, setRatings]       = useState<any[]>([]);
  const [average, setAverage]       = useState<number | null>(null);
  const [myScore, setMyScore]       = useState(0);
  const [myComment, setMyComment]   = useState('');
  const [myRating, setMyRating]     = useState<any>(null);
  const [saving, setSaving]         = useState(false);
  const [ratingError, setRatingError] = useState('');

  useEffect(() => {
    api.get(`/events/${eventId}/ratings`).then(({ data }) => {
      setRatings(data.ratings); setAverage(data.average);
    });
    if (isEnrolled && !isCreator) {
      api.get(`/events/${eventId}/ratings/me`).then(({ data }) => {
        if (data.rating) { setMyRating(data.rating); setMyScore(data.rating.score); setMyComment(data.rating.comment ?? ''); }
      });
    }
  }, [eventId, isEnrolled, isCreator]);

  const handleSubmit = async () => {
    if (!myScore) return setRatingError('Selecciona una puntuación');
    setSaving(true); setRatingError('');
    try {
      const { data } = await api.post(`/events/${eventId}/ratings`, { score: myScore, comment: myComment || null });
      setMyRating(data.rating);
      api.get(`/events/${eventId}/ratings`).then(({ data: d }) => { setRatings(d.ratings); setAverage(d.average); });
    } catch (err: any) {
      setRatingError(err.response?.data?.error || 'Error al guardar');
    } finally { setSaving(false); }
  };

  return (
    <View style={ratingStyles.container}>
      <View style={ratingStyles.header}>
        <Text style={ratingStyles.title}>VALORACIONES</Text>
        {average !== null && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Stars value={Math.round(average)} />
            <Text style={ratingStyles.avg}>{average.toFixed(1)} ({ratings.length})</Text>
          </View>
        )}
      </View>

      {isEnrolled && !isCreator && (
        <View style={ratingStyles.form}>
          <Text style={ratingStyles.formLabel}>{myRating ? 'Tu valoración' : 'Valora este evento'}</Text>
          <Stars value={myScore} onPress={setMyScore} />
          <TextInput style={ratingStyles.commentInput} value={myComment} onChangeText={setMyComment}
            placeholder="Comentario opcional..." placeholderTextColor={Colors.textMuted}
            multiline numberOfLines={2} textAlignVertical="top" maxLength={300} />
          {ratingError ? <Text style={{ color: Colors.error, fontSize: 12 }}>{ratingError}</Text> : null}
          <Pressable style={[ratingStyles.btn, saving && { opacity: 0.5 }]} onPress={handleSubmit} disabled={saving}>
            <Text style={ratingStyles.btnText}>{saving ? 'Guardando...' : myRating ? 'Actualizar' : 'Enviar valoración'}</Text>
          </Pressable>
        </View>
      )}

      {ratings.length === 0 ? (
        <Text style={ratingStyles.empty}>Todavía no hay valoraciones.</Text>
      ) : (
        <View style={{ gap: 12 }}>
          {ratings.map((r) => (
            <View key={r.id} style={ratingStyles.ratingRow}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={ratingStyles.raterName}>{r.rater.name}</Text>
                <Stars value={r.score} />
              </View>
              {r.comment ? <Text style={ratingStyles.comment}>{r.comment}</Text> : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function Stars({ value, onPress }: { value: number; onPress?: (n: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onPress?.(n)} disabled={!onPress}>
          <Text style={{ fontSize: onPress ? 28 : 16, color: n <= value ? Colors.accent : Colors.border }}>★</Text>
        </Pressable>
      ))}
    </View>
  );
}

const ratingStyles = StyleSheet.create({
  container:    { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 16, gap: 14 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title:        { color: Colors.textMuted, fontSize: 11, letterSpacing: 2 },
  avg:          { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  form:         { gap: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  formLabel:    { color: Colors.textSecondary, fontSize: 13 },
  commentInput: { backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 10, color: Colors.textPrimary, fontSize: 14, height: 70 },
  btn:          { backgroundColor: Colors.accent, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnText:      { color: Colors.accentDark, fontWeight: '700', fontSize: 14 },
  empty:        { color: Colors.textMuted, fontSize: 13 },
  ratingRow:    { gap: 4, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10 },
  raterName:    { color: Colors.textPrimary, fontSize: 14, fontWeight: '500' },
  comment:      { color: Colors.textSecondary, fontSize: 13 },
});

function Wall({ messages, connected, wallError, onSend, userId }: {
  messages: any[]; connected: boolean; wallError: string;
  onSend: (content: string) => void; userId: number;
}) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <View style={wallStyles.container}>
      <View style={wallStyles.header}>
        <Text style={wallStyles.title}>MURO DEL EVENTO</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={[wallStyles.dot, { backgroundColor: connected ? '#4ade80' : Colors.textMuted }]} />
          <Text style={wallStyles.status}>{connected ? 'En vivo' : 'Conectando...'}</Text>
        </View>
      </View>

      {wallError ? (
        <Text style={wallStyles.error}>{wallError}</Text>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={wallStyles.list}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          bounces={false}
          nestedScrollEnabled
        >
          {messages.length === 0 && (
            <Text style={wallStyles.empty}>No hay mensajes. ¡Sé el primero!</Text>
          )}
          {messages.map((item) => {
            const isOwn = item.userId === userId;
            return (
              <View key={item.id} style={[wallStyles.msgRow, isOwn && wallStyles.msgRowOwn]}>
                <View style={[wallStyles.bubble, isOwn ? wallStyles.bubbleOwn : wallStyles.bubbleOther]}>
                  {!isOwn && <Text style={wallStyles.msgName}>{item.user?.name}</Text>}
                  <Text style={[wallStyles.msgText, isOwn && wallStyles.msgTextOwn]}>{item.content}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {!wallError && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={wallStyles.inputRow}>
            <TextInput
              style={wallStyles.input}
              value={input}
              onChangeText={setInput}
              placeholder={connected ? 'Escribe un mensaje...' : 'Conectando...'}
              placeholderTextColor={Colors.textMuted}
              editable={connected}
              maxLength={500}
              onSubmitEditing={handleSend}
            />
            <Pressable style={[wallStyles.sendBtn, !connected && wallStyles.sendBtnDisabled]} onPress={handleSend} disabled={!connected}>
              <Text style={wallStyles.sendBtnText}>›</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const wallStyles = StyleSheet.create({
  container:  { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, overflow: 'hidden' },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title:      { color: Colors.textMuted, fontSize: 11, letterSpacing: 2 },
  dot:        { width: 8, height: 8, borderRadius: 4 },
  status:     { color: Colors.textMuted, fontSize: 12 },
  error:      { color: Colors.error, fontSize: 13, padding: 14 },
  list:       { maxHeight: 260, padding: 12 },
  empty:      { color: Colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 20 },
  msgRow:     { marginBottom: 10, alignItems: 'flex-start' },
  msgRowOwn:  { alignItems: 'flex-end' },
  bubble:     { maxWidth: '80%', borderRadius: 14, padding: 10 },
  bubbleOwn:  { backgroundColor: Colors.accent },
  bubbleOther:{ backgroundColor: Colors.bg },
  msgName:    { color: Colors.textMuted, fontSize: 11, marginBottom: 4 },
  msgText:    { color: Colors.textPrimary, fontSize: 14 },
  msgTextOwn: { color: Colors.accentDark },
  inputRow:   { flexDirection: 'row', padding: 10, gap: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  input:      { flex: 1, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: Colors.textPrimary, fontSize: 14 },
  sendBtn:    { backgroundColor: Colors.accent, borderRadius: 10, width: 44, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText:{ color: Colors.accentDark, fontSize: 22, fontWeight: '700' },
});

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Colors.bg },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  scroll:    { paddingBottom: 24 },
  dots:      { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.accent, width: 20 },
  content:   { padding: 20, gap: 12 },
  meta:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  category:  { backgroundColor: Colors.surface, color: Colors.textSecondary, fontSize: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  dateText:  { color: Colors.textMuted, fontSize: 12 },
  title:     { color: Colors.textPrimary, fontSize: 26, fontWeight: '700' },
  sub:       { color: Colors.textSecondary, fontSize: 14 },
  creatorRow:       { flexDirection: 'row', alignItems: 'center' },
  creator:          { color: Colors.textMuted, fontSize: 13 },
  creatorName:      { color: Colors.textPrimary, textDecorationLine: 'underline' },
  creatorRating:    { color: Colors.accent, fontFamily: 'monospace', fontSize: 12 },
  creatorRatingCount: { color: Colors.textMuted, fontSize: 12 },
  capacityBox: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, gap: 6 },
  capacityRow: { flexDirection: 'row', justifyContent: 'space-between' },
  capacityLabel: { color: Colors.textMuted, fontSize: 13 },
  capacityCount: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  progressBg:    { height: 6, backgroundColor: Colors.border, borderRadius: 3 },
  progressFill:  { height: 6, borderRadius: 3 },
  section:       { gap: 6 },
  sectionTitle:  { color: Colors.textMuted, fontSize: 11, letterSpacing: 2 },
  description:   { color: Colors.textSecondary, fontSize: 15, lineHeight: 22 },
  enrolledCount: { color: Colors.textSecondary, fontSize: 15 },
  actions:       { padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  enrollBtn:     { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  enrollBtnText: { color: Colors.accentDark, fontWeight: '700', fontSize: 16 },
  unenrollBtn:   { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  unenrollBtnText: { color: Colors.error, fontWeight: '600', fontSize: 16 },
  editBtn:       { borderWidth: 1, borderColor: Colors.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  editBtnText:   { color: Colors.accent, fontWeight: '600', fontSize: 15 },
  deleteBtn:     { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  deleteBtnText: { color: Colors.error, fontWeight: '600', fontSize: 15 },
  btnDisabled:   { opacity: 0.5 },
  mapsBtn:       { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  mapsBtnText:   { color: Colors.accent, fontSize: 12, fontWeight: '600' },
});
