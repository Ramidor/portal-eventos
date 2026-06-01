import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { CATEGORIES } from '@/constants/categories';
import DatePickerField from '@/components/DatePickerField';
import FormField from '@/components/FormField';
import ImagePickerField from '@/components/ImagePickerField';
import LocationPicker from '@/components/LocationPicker';
import api from '@/services/api';

type FormState = {
  title: string; description: string; location: string;
  latitude: number | null; longitude: number | null;
  category: string; maxAttendees: string;
  images: string[];
};

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [form, setForm] = useState<FormState>({
    title: '', description: '', location: '',
    latitude: null, longitude: null,
    category: 'OTRO', maxAttendees: '',
    images: [],
  });
  const [date, setDate]       = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get(`/events/${id}`).then(({ data }) => {
      setForm({
        title: data.title ?? '', description: data.description ?? '',
        location: data.location ?? '', latitude: data.latitude ?? null,
        longitude: data.longitude ?? null, category: data.category ?? 'OTRO',
        maxAttendees: data.maxAttendees ? String(data.maxAttendees) : '',
        images: data.images ?? [],
      });
      setDate(new Date(data.date));
    }).finally(() => setLoading(false));
  }, [id]);

  const set = (field: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.title || !date || !form.location) return setError('Título, fecha y ubicación son obligatorios');
    setSaving(true); setError('');
    try {
      await api.put(`/events/${id}`, {
        ...form,
        date: date.toISOString(),
        maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : null,
      });
      router.back();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar el evento';
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? msg);
    } finally { setSaving(false); }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color={Colors.accent} size="large" />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>

          <FormField label="TÍTULO *">
            <TextInput style={styles.input} value={form.title} onChangeText={(v) => set('title', v)}
              placeholder="Nombre del evento" placeholderTextColor={Colors.textMuted} />
          </FormField>

          <FormField label="DESCRIPCIÓN">
            <TextInput style={[styles.input, styles.textarea]} value={form.description}
              onChangeText={(v) => set('description', v)} placeholder="Describe el evento..."
              placeholderTextColor={Colors.textMuted} multiline numberOfLines={4} textAlignVertical="top" />
          </FormField>

          <DatePickerField value={date} onChange={setDate} />

          <FormField label="UBICACIÓN *">
            <LocationPicker
              value={form.location}
              onSelect={(name, lat, lng) => setForm((f) => ({ ...f, location: name, latitude: lat, longitude: lng }))}
            />
          </FormField>

          <FormField label="CATEGORÍA">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chips}>
                {CATEGORIES.map((c) => (
                  <Pressable key={c.value} style={[styles.chip, form.category === c.value && styles.chipActive]}
                    onPress={() => set('category', c.value)}>
                    <Text style={[styles.chipText, form.category === c.value && styles.chipTextActive]}>{c.label}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </FormField>

          <FormField label="IMÁGENES (opcional)">
            <ImagePickerField
              images={form.images}
              onChange={(urls) => setForm((f) => ({ ...f, images: urls }))}
            />
          </FormField>

          <FormField label="AFORO MÁXIMO (opcional)">
            <TextInput style={styles.input} value={form.maxAttendees} onChangeText={(v) => set('maxAttendees', v)}
              placeholder="Sin límite" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
          </FormField>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={[styles.btn, saving && styles.btnDisabled]} onPress={handleSave} disabled={saving}>
            <Text style={styles.btnText}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.bg },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  scroll:      { padding: 20, gap: 20, paddingBottom: 40 },
  input:       { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: Colors.textPrimary, fontSize: 15 },
  textarea:    { height: 100, paddingTop: 12 },
  chips:       { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  chip:        { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive:  { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText:    { color: Colors.textSecondary, fontSize: 13 },
  chipTextActive: { color: Colors.accentDark, fontWeight: '600' },
  error:       { color: Colors.error, fontSize: 13 },
  btn:         { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.5 },
  btnText:     { color: Colors.accentDark, fontWeight: '700', fontSize: 16 },
});
