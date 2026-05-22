import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="verify-email" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="events/[id]"
          options={{
            headerShown: true,
            headerTitle: '',
            headerStyle: { backgroundColor: Colors.bg },
            headerTintColor: Colors.accent,
          }}
        />
        <Stack.Screen
          name="events/new"
          options={{
            headerShown: true,
            headerTitle: 'Crear evento',
            headerStyle: { backgroundColor: Colors.bg },
            headerTintColor: Colors.accent,
          }}
        />
        <Stack.Screen
          name="users/[id]"
          options={{
            headerShown: true,
            headerTitle: 'Perfil',
            headerStyle: { backgroundColor: Colors.bg },
            headerTintColor: Colors.accent,
          }}
        />
        <Stack.Screen
          name="events/[id]/edit"
          options={{
            headerShown: true,
            headerTitle: 'Editar evento',
            headerStyle: { backgroundColor: Colors.bg },
            headerTintColor: Colors.accent,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
