import { useState } from 'react';
import {
  ActivityIndicator, FlatList, Pressable,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Colors } from '@/constants/colors';

type Result = { display_name: string; lat: string; lon: string };

type Props = {
  value: string;
  onSelect: (name: string, lat: number, lng: number) => void;
};

export default function LocationPicker({ value, onSelect }: Props) {
  const [query, setQuery]       = useState(value);
  const [results, setResults]   = useState<Result[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selected, setSelected] = useState(!!value);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true); setSearchError(''); setResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=es`,
        { headers: { 'User-Agent': 'PortalEventosTFG/1.0' } }
      );
      const data: Result[] = await res.json();
      if (data.length === 0) setSearchError('No se encontró esa ubicación');
      else setResults(data);
    } catch {
      setSearchError('Error al buscar la ubicación');
    } finally { setSearching(false); }
  };

  const handleSelect = (item: Result) => {
    const name = item.display_name;
    setQuery(name);
    setResults([]);
    setSelected(true);
    onSelect(name, parseFloat(item.lat), parseFloat(item.lon));
  };

  const handleChangeQuery = (text: string) => {
    setQuery(text);
    setSelected(false);
    setResults([]);
    setSearchError('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, selected && styles.inputSelected]}
          value={query}
          onChangeText={handleChangeQuery}
          placeholder="Buscar ciudad o lugar..."
          placeholderTextColor={Colors.textMuted}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Pressable style={[styles.searchBtn, searching && styles.searchBtnDisabled]} onPress={handleSearch} disabled={searching}>
          {searching
            ? <ActivityIndicator color={Colors.accentDark} size="small" />
            : <Text style={styles.searchBtnText}>Buscar</Text>
          }
        </Pressable>
      </View>

      {searchError ? <Text style={styles.error}>{searchError}</Text> : null}

      {results.length > 0 && (
        <View style={styles.results}>
          <FlatList
            data={results}
            keyExtractor={(_, i) => String(i)}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Pressable style={styles.resultItem} onPress={() => handleSelect(item)}>
                <Text style={styles.resultText} numberOfLines={2}>{item.display_name}</Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {selected && value && (
        <Text style={styles.selectedHint}>📍 {value.split(',').slice(0, 3).join(',')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { gap: 8 },
  row:             { flexDirection: 'row', gap: 8 },
  input:           { flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: Colors.textPrimary, fontSize: 15 },
  inputSelected:   { borderColor: Colors.accent },
  searchBtn:       { backgroundColor: Colors.accent, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  searchBtnDisabled: { opacity: 0.6 },
  searchBtnText:   { color: Colors.accentDark, fontWeight: '700', fontSize: 14 },
  error:           { color: Colors.error, fontSize: 12 },
  results:         { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, overflow: 'hidden' },
  resultItem:      { padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  resultText:      { color: Colors.textPrimary, fontSize: 14 },
  selectedHint:    { color: Colors.textMuted, fontSize: 12 },
});
