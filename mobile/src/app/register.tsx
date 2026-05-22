import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import api from '@/services/api';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/;

export default function RegisterScreen() {
  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const set = (field: string, value: string) => { setForm((f) => ({ ...f, [field]: value })); setError(''); };

  const handleRegister = async () => {
    if (!PASSWORD_REGEX.test(form.password)) {
      return setError('La contraseña debe tener 8+ caracteres, una mayúscula, un número y un símbolo');
    }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      router.push({ pathname: '/verify-email', params: { email: form.email } });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally { setLoading(false); }
  };

  const checks = [
    { label: '8 caracteres mínimo', ok: form.password.length >= 8 },
    { label: 'Una mayúscula',        ok: /[A-Z]/.test(form.password) },
    { label: 'Un número',            ok: /\d/.test(form.password) },
    { label: 'Un símbolo',           ok: /[!@#$%^&*()\-_=+{};:,<.>]/.test(form.password) },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>NUEVO USUARIO</Text>
            <Text style={styles.title}>Crear cuenta</Text>
          </View>

          <View style={styles.form}>
            {[
              { label: 'NOMBRE', field: 'name', placeholder: 'Tu nombre', secure: false, keyboard: 'default' as const },
              { label: 'EMAIL',  field: 'email', placeholder: 'tu@email.com', secure: false, keyboard: 'email-address' as const },
              { label: 'CONTRASEÑA', field: 'password', placeholder: 'Mínimo 8 caracteres', secure: true, keyboard: 'default' as const },
            ].map(({ label, field, placeholder, secure, keyboard }) => (
              <View key={field}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={(form as any)[field]}
                  onChangeText={(v) => set(field, v)}
                  placeholder={placeholder}
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={secure}
                  keyboardType={keyboard}
                  autoCapitalize="none"
                />
              </View>
            ))}

            {form.password.length > 0 && (
              <View style={{ gap: 4, marginTop: 4 }}>
                {checks.map((c) => (
                  <Text key={c.label} style={{ color: c.ok ? '#4ade80' : Colors.textMuted, fontSize: 12 }}>
                    {c.ok ? '✓' : '○'}  {c.label}
                  </Text>
                ))}
              </View>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable style={[styles.btn, loading && styles.btnDisabled]} onPress={handleRegister} disabled={loading}>
              <Text style={styles.btnText}>{loading ? 'Enviando código...' : 'Crear cuenta'}</Text>
            </Pressable>
          </View>

          <Pressable onPress={() => router.push('/login')}>
            <Text style={styles.footer}>¿Ya tienes cuenta? <Text style={{ color: Colors.accent }}>Inicia sesión</Text></Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.bg },
  container:  { padding: 24, gap: 32 },
  header:     { gap: 6 },
  eyebrow:    { color: Colors.textMuted, fontSize: 11, letterSpacing: 3 },
  title:      { color: Colors.textPrimary, fontSize: 32, fontWeight: '700' },
  form:       { gap: 14 },
  fieldLabel: { color: Colors.textSecondary, fontSize: 11, letterSpacing: 2, marginBottom: 6 },
  input:      { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: Colors.textPrimary, fontSize: 15 },
  error:      { color: Colors.error, fontSize: 13 },
  btn:        { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 6 },
  btnDisabled:{ opacity: 0.5 },
  btnText:    { color: Colors.accentDark, fontWeight: '700', fontSize: 15 },
  footer:     { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
});
