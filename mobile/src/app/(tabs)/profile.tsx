import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';
import api from '@/services/api';

type Event = { id: number; title: string; date: string; location: string };
type Enrollment = { event: Event };

export default function ProfileScreen() {
  const { user, login, token, logout } = useAuth();

  const [myEvents, setMyEvents]           = useState<Event[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);
  const [ratingSummary, setRatingSummary] = useState<{ average: number | null; total: number } | null>(null);
  const [loading, setLoading]             = useState(true);
  const [editing, setEditing]             = useState(false);
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', currentPassword: '', newPassword: '' });
  const [saving, setSaving]   = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    Promise.allSettled([
      api.get('/users/me/events'),
      api.get('/users/me/enrollments'),
      api.get('/users/me/rating-summary'),
    ]).then(([evRes, enRes, ratingRes]) => {
      if (evRes.status === 'fulfilled')     setMyEvents(evRes.value.data.events);
      if (enRes.status === 'fulfilled')     setMyEnrollments(enRes.value.data.enrollments);
      if (ratingRes.status === 'fulfilled') setRatingSummary(ratingRes.value.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setSaveError('');
    try {
      const payload: any = {};
      if (form.name !== user?.name)   payload.name  = form.name;
      if (form.email !== user?.email) payload.email = form.email;
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword     = form.newPassword;
      }
      if (!Object.keys(payload).length) { setEditing(false); setSaving(false); return; }
      const { data } = await api.put('/users/me', payload);
      await login(data.user, token!);
      setForm({ name: data.user.name, email: data.user.email, currentPassword: '', newPassword: '' });
      setEditing(false);
    } catch (err: any) {
      setSaveError(err.response?.data?.error || 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: async () => { await logout(); router.replace('/login'); } },
    ]);
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color={Colors.accent} size="large" />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>

          {/* Cabecera */}
          <View>
            <Text style={styles.eyebrow}>MI CUENTA</Text>
            <Text style={styles.name}>{user?.name}</Text>
          </View>

          {/* Perfil */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>PERFIL</Text>
              {!editing && (
                <Pressable onPress={() => setEditing(true)}>
                  <Text style={{ color: Colors.accent, fontSize: 13 }}>Editar</Text>
                </Pressable>
              )}
            </View>

            {!editing ? (
              <View style={{ gap: 12 }}>
                <InfoRow label="Nombre" value={user?.name ?? ''} />
                <InfoRow label="Email"  value={user?.email ?? ''} />
                {ratingSummary && ratingSummary.total > 0 && (
                  <InfoRow label="Valoración" value={`${'★'.repeat(Math.round(ratingSummary.average ?? 0))} ${ratingSummary.average?.toFixed(1)} (${ratingSummary.total})`} />
                )}
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                <FormField label="Nombre">
                  <TextInput style={styles.input} value={form.name}
                    onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                    placeholderTextColor={Colors.textMuted} />
                </FormField>
                <FormField label="Email">
                  <TextInput style={styles.input} value={form.email}
                    onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
                    keyboardType="email-address" autoCapitalize="none"
                    placeholderTextColor={Colors.textMuted} />
                </FormField>
                <View style={styles.separator} />
                <Text style={styles.sectionTitle}>CAMBIAR CONTRASEÑA</Text>
                <FormField label="Contraseña actual">
                  <TextInput style={styles.input} value={form.currentPassword}
                    onChangeText={(v) => setForm((f) => ({ ...f, currentPassword: v }))}
                    secureTextEntry placeholder="Tu contraseña actual" placeholderTextColor={Colors.textMuted} />
                </FormField>
                <FormField label="Nueva contraseña">
                  <TextInput style={styles.input} value={form.newPassword}
                    onChangeText={(v) => setForm((f) => ({ ...f, newPassword: v }))}
                    secureTextEntry placeholder="Mínimo 8 caracteres" placeholderTextColor={Colors.textMuted} />
                </FormField>
                {saveError ? <Text style={{ color: Colors.error, fontSize: 13 }}>{saveError}</Text> : null}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Pressable style={[styles.btn, { flex: 1 }, saving && styles.btnDisabled]} onPress={handleSave} disabled={saving}>
                    <Text style={styles.btnText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
                  </Pressable>
                  <Pressable style={[styles.cancelBtn, { flex: 1 }]} onPress={() => { setEditing(false); setSaveError(''); }}>
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* Mis eventos */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>EVENTOS ORGANIZADOS ({myEvents.length})</Text>
            {myEvents.length === 0 ? (
              <Text style={styles.empty}>Todavía no has organizado ningún evento.</Text>
            ) : (
              <View style={{ gap: 10 }}>
                {myEvents.map((e) => <EventRow key={e.id} event={e} />)}
              </View>
            )}
          </View>

          {/* Mis inscripciones */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>INSCRIPCIONES ({myEnrollments.length})</Text>
            {myEnrollments.length === 0 ? (
              <Text style={styles.empty}>Todavía no estás inscrito en ningún evento.</Text>
            ) : (
              <View style={{ gap: 10 }}>
                {myEnrollments.map((e) => <EventRow key={e.event.id} event={e.event} />)}
              </View>
            )}
          </View>

          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={{ color: Colors.textMuted, fontSize: 11, letterSpacing: 2 }}>{label.toUpperCase()}</Text>
      <Text style={{ color: Colors.textPrimary, fontSize: 15 }}>{value}</Text>
    </View>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: Colors.textMuted, fontSize: 11, letterSpacing: 2 }}>{label.toUpperCase()}</Text>
      {children}
    </View>
  );
}

function EventRow({ event }: { event: Event }) {
  const date = new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <Pressable onPress={() => router.push(`/events/${event.id}` as any)} style={styles.eventRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={styles.eventMeta}>{date} · {event.location}</Text>
      </View>
      <Text style={{ color: Colors.textMuted }}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.bg },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  scroll:     { padding: 20, gap: 16, paddingBottom: 40 },
  eyebrow:    { color: Colors.textMuted, fontSize: 11, letterSpacing: 3 },
  name:       { color: Colors.textPrimary, fontSize: 30, fontWeight: '700', marginTop: 4 },
  card:       { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 18, gap: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: Colors.textMuted, fontSize: 11, letterSpacing: 2, fontWeight: '600' },
  separator:  { height: 1, backgroundColor: Colors.border },
  input:      { backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: Colors.textPrimary, fontSize: 15 },
  btn:        { backgroundColor: Colors.accent, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  btnDisabled:{ opacity: 0.5 },
  btnText:    { color: Colors.accentDark, fontWeight: '700', fontSize: 14 },
  cancelBtn:  { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  cancelBtnText: { color: Colors.textSecondary, fontSize: 14 },
  empty:      { color: Colors.textMuted, fontSize: 14 },
  eventRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  eventTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '500' },
  eventMeta:  { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  logoutBtn:  { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  logoutText: { color: Colors.error, fontSize: 15, fontWeight: '600' },
});
