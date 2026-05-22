import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import FormField from './FormField';

type Props = {
  value: Date | null;
  onChange: (date: Date) => void;
  minimumDate?: Date;
};

export function formatDate(d: Date) {
  return (
    d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) +
    '  ·  ' +
    d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  );
}

export default function DatePickerField({ value, onChange, minimumDate }: Props) {
  const [show, setShow]           = useState(false);
  const [mode, setMode]           = useState<'date' | 'time'>('date');
  const minDate                   = minimumDate ?? new Date();

  const handleChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (!selected) { setShow(false); return; }
    if (Platform.OS === 'android') {
      setShow(false);
      if (mode === 'date') {
        onChange(selected);
        setTimeout(() => { setMode('time'); setShow(true); }, 100);
      } else {
        const merged = new Date(value ?? selected);
        merged.setHours(selected.getHours(), selected.getMinutes());
        onChange(merged);
        setMode('date');
      }
    } else {
      onChange(selected);
    }
  };

  return (
    <FormField label="FECHA Y HORA *">
      <Pressable style={styles.btn} onPress={() => { setMode('date'); setShow(true); }}>
        <Text style={value ? styles.value : styles.placeholder}>
          {value ? formatDate(value) : 'Seleccionar fecha y hora'}
        </Text>
        <Text>📅</Text>
      </Pressable>

      {Platform.OS === 'ios' && show && (
        <Modal transparent animationType="slide">
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <Pressable onPress={() => setShow(false)}>
                  <Text style={styles.cancel}>Cancelar</Text>
                </Pressable>
                <Pressable onPress={() => setShow(false)}>
                  <Text style={styles.done}>Listo</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={value ?? minDate}
                mode="datetime"
                display="spinner"
                minimumDate={minDate}
                onChange={handleChange}
                locale="es-ES"
                textColor={Colors.textPrimary}
                themeVariant="dark"
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'android' && show && (
        <DateTimePicker
          value={value ?? minDate}
          mode={mode}
          minimumDate={minDate}
          onChange={handleChange}
        />
      )}
    </FormField>
  );
}

const styles = StyleSheet.create({
  btn:         { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  value:       { color: Colors.textPrimary, fontSize: 15 },
  placeholder: { color: Colors.textMuted, fontSize: 15 },
  overlay:     { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet:       { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  cancel:      { color: Colors.textMuted, fontSize: 15 },
  done:        { color: Colors.accent, fontSize: 15, fontWeight: '600' },
});
