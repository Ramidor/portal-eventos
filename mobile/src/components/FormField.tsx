import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';

export default function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label:     { color: Colors.textSecondary, fontSize: 11, letterSpacing: 2 },
});
