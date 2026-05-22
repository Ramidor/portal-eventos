import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';
import api from '@/services/api';

export default function VerifyEmailScreen() {
  const { login } = useAuth();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode]       = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) inputs.current[index - 1]?.focus();
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) return setError('Introduce los 6 dígitos');
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/verify-email', { email, code: fullCode });
      await login(data.user, data.token);
      router.replace('/(tabs)');
    } catch (err: any) {
      const serverCode = err.response?.data?.code;
      setError(err.response?.data?.error || 'Error al verificar');
      if (serverCode === 'CODE_EXPIRED') setCode(['', '', '', '', '', '']);
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-verification', { email });
      setCode(['', '', '', '', '', '']);
      setError('');
      inputs.current[0]?.focus();
    } catch { setError('Error al reenviar el código'); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.emoji}>📬</Text>
        <Text style={styles.title}>Revisa tu email</Text>
        <Text style={styles.subtitle}>
          Código enviado a <Text style={{ color: Colors.textPrimary }}>{email}</Text>
        </Text>

        <View style={styles.otpRow}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={(el) => { if (el) inputs.current[i] = el; }}
              style={styles.otpInput}
              value={digit}
              onChangeText={(v) => handleChange(i, v)}
              onKeyPress={({ nativeEvent }) => handleKeyDown(i, nativeEvent.key)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.btn, (loading || code.join('').length < 6) && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={loading || code.join('').length < 6}
        >
          <Text style={styles.btnText}>{loading ? 'Verificando...' : 'Verificar cuenta'}</Text>
        </Pressable>

        <Pressable onPress={handleResend}>
          <Text style={styles.resend}>¿No recibiste el código? Reenviar</Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/login')}>
          <Text style={styles.back}>← Volver al login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.bg },
  container:  { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emoji:      { fontSize: 48 },
  title:      { color: Colors.textPrimary, fontSize: 26, fontWeight: '700' },
  subtitle:   { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
  otpRow:     { flexDirection: 'row', gap: 10, marginVertical: 8 },
  otpInput:   { width: 48, height: 60, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, textAlign: 'center', fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  error:      { color: Colors.error, fontSize: 13 },
  btn:        { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 32, alignSelf: 'stretch', alignItems: 'center' },
  btnDisabled:{ opacity: 0.5 },
  btnText:    { color: Colors.accentDark, fontWeight: '700', fontSize: 15 },
  resend:     { color: Colors.textMuted, fontSize: 13, marginTop: 8 },
  back:       { color: Colors.textMuted, fontSize: 13 },
});
