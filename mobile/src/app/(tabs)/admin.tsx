import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';
import api from '@/services/api';

type User = { id: number; name: string; email: string; role: 'USER' | 'ADMIN'; _count: { organizedEvents: number; enrollments: number } };

export default function AdminScreen() {
  const { user } = useAuth();
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchUsers = useCallback(() =>
    api.get('/users/admin/users').then(({ data }) => setUsers(data.users)), []);

  useEffect(() => {
    setLoading(true);
    fetchUsers().catch(() => setError('Error al cargar usuarios')).finally(() => setLoading(false));
  }, [fetchUsers]);

  const handleRoleChange = async (targetId: number, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    Alert.alert('Cambiar rol', `¿Cambiar a ${newRole}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar', onPress: async () => {
          try { await api.patch(`/users/admin/users/${targetId}/role`, { role: newRole }); await fetchUsers(); }
          catch (err: unknown) { Alert.alert('Error', (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error'); }
        },
      },
    ]);
  };

  const handleDelete = async (targetId: number, name: string) => {
    Alert.alert('Eliminar usuario', `¿Eliminar a ${name}? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try { await api.delete(`/users/admin/users/${targetId}`); setUsers((prev) => prev.filter((u) => u.id !== targetId)); }
          catch (err: unknown) { Alert.alert('Error', (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error'); }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>PANEL DE ADMINISTRACIÓN</Text>
        <Text style={styles.title}>Usuarios</Text>
      </View>

      {loading && <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && !error && (
        <ScrollView contentContainerStyle={styles.list}>
          {users.map((u) => (
            <View key={u.id} style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.userName}>{u.name}</Text>
                <Text style={styles.userEmail}>{u.email}</Text>
                <View style={styles.meta}>
                  <Text style={[styles.roleTag, u.role === 'ADMIN' && styles.roleTagAdmin]}>{u.role}</Text>
                  <Text style={styles.metaText}>{u._count.organizedEvents} eventos · {u._count.enrollments} inscripciones</Text>
                </View>
              </View>
              {u.id !== user?.id && (
                <View style={styles.actions}>
                  <Pressable onPress={() => handleRoleChange(u.id, u.role)} style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>{u.role === 'ADMIN' ? '→ USER' : '→ ADMIN'}</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDelete(u.id, u.name)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>Eliminar</Text>
                  </Pressable>
                </View>
              )}
              {u.id === user?.id && <Text style={styles.you}>Tú</Text>}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.bg },
  header:       { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  eyebrow:      { color: Colors.textMuted, fontSize: 11, letterSpacing: 3 },
  title:        { color: Colors.textPrimary, fontSize: 28, fontWeight: '700', marginTop: 4 },
  error:        { color: Colors.error, margin: 20 },
  list:         { padding: 20, gap: 12, paddingBottom: 40 },
  card:         { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 16, gap: 10 },
  cardInfo:     { gap: 4 },
  userName:     { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  userEmail:    { color: Colors.textMuted, fontSize: 13 },
  meta:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  roleTag:      { backgroundColor: Colors.border, color: Colors.textSecondary, fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  roleTagAdmin: { backgroundColor: 'rgba(251,191,36,0.15)', color: Colors.accent },
  metaText:     { color: Colors.textMuted, fontSize: 12 },
  actions:      { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10 },
  actionBtn:    { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  actionBtnText:{ color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  deleteBtn:    { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  deleteBtnText:{ color: Colors.error, fontSize: 13, fontWeight: '500' },
  you:          { color: Colors.textMuted, fontSize: 12, textAlign: 'right' },
});
