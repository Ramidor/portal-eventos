import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';
import api from '@/services/api';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Rellena todos los campos'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await login(data.user, data.token);
      router.replace('/(tabs)');
    } catch (err: any) {
      const code = err.response?.data?.code;
      if (code === 'EMAIL_NOT_VERIFIED') {
        router.push({ pathname: '/verify-email', params: { email } });
      } else {
        setError(err.response?.data?.error || 'Error al iniciar sesión');
      }
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>

        <View style={styles.header}>
          <Text style={styles.label}>PORTAL DE EVENTOS</Text>
          <Text style={styles.title}>Iniciar sesión</Text>
        </View>

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

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>CONTRASEÑA</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={(t) => { setPassword(t); setError(''); }}
            placeholder="••••••••"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
          </Pressable>

          <Pressable onPress={() => router.push('/forgot-password')}>
            <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/register')}>
          <Text style={styles.footer}>
            ¿No tienes cuenta? <Text style={{ color: Colors.accent }}>Regístrate</Text>
          </Text>
        </Pressable>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 32 },
  header:    { gap: 8 },
  label:     { color: Colors.textMuted, fontSize: 11, letterSpacing: 3, fontWeight: '500' },
  title:     { color: Colors.textPrimary, fontSize: 32, fontWeight: '700' },
  form:      { gap: 4 },
  fieldLabel:{ color: Colors.textSecondary, fontSize: 11, letterSpacing: 2, fontWeight: '500', marginBottom: 6 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    color: Colors.textPrimary, fontSize: 15,
  },
  error: { color: Colors.error, fontSize: 13, marginTop: 8 },
  btn: {
    backgroundColor: Colors.accent, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 20,
  },
  btnDisabled: { opacity: 0.5 },
  btnText:     { color: Colors.accentDark, fontWeight: '700', fontSize: 15 },
  link:        { color: Colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 12 },
  footer:      { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
});
