import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import api from '@/services/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch { setError('Error al procesar la solicitud'); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>SEGURIDAD</Text>
          <Text style={styles.title}>¿Olvidaste tu{'\n'}contraseña?</Text>
        </View>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✓ Si el email existe y está verificado, recibirás un enlace en breve.</Text>
            <Pressable onPress={() => router.replace('/login')}>
              <Text style={[styles.link, { marginTop: 16 }]}>← Volver al login</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.fieldLabel}>EMAIL</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              placeholder="tu@email.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.btnText}>{loading ? 'Enviando...' : 'Enviar enlace'}</Text>
            </Pressable>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.link}>← Volver al login</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.bg },
  container:  { flex: 1, padding: 24, justifyContent: 'center', gap: 32 },
  header:     { gap: 6 },
  eyebrow:    { color: Colors.textMuted, fontSize: 11, letterSpacing: 3 },
  title:      { color: Colors.textPrimary, fontSize: 32, fontWeight: '700' },
  form:       { gap: 12 },
  fieldLabel: { color: Colors.textSecondary, fontSize: 11, letterSpacing: 2, marginBottom: 4 },
  input:      { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: Colors.textPrimary, fontSize: 15 },
  error:      { color: Colors.error, fontSize: 13 },
  btn:        { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  btnDisabled:{ opacity: 0.5 },
  btnText:    { color: Colors.accentDark, fontWeight: '700', fontSize: 15 },
  link:       { color: Colors.textMuted, fontSize: 13, textAlign: 'center' },
  successBox: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#166534', borderRadius: 14, padding: 20, alignItems: 'center' },
  successText:{ color: '#4ade80', fontSize: 14, textAlign: 'center' },
});
