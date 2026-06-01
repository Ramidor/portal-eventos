import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { X, ImagePlus } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import api from '@/services/api';

type Props = {
  images: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
};

export default function ImagePickerField({ images, onChange, maxImages = 5 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');

  const pick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Se necesita permiso para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: maxImages - images.length,
    });

    if (result.canceled || !result.assets.length) return;

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      for (const asset of result.assets) {
        formData.append('images', {
          uri: asset.uri,
          type: asset.mimeType ?? 'image/jpeg',
          name: asset.fileName ?? `photo_${Date.now()}.jpg`,
        } as unknown as Blob);
      }
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange([...images, ...data.urls]);
    } catch {
      setError('Error al subir las imágenes');
    } finally {
      setUploading(false);
    }
  };

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
          <View style={styles.thumbRow}>
            {images.map((url, i) => (
              <View key={url} style={styles.thumbWrap}>
                <Image source={{ uri: url }} style={styles.thumb} />
                <Pressable style={styles.removeBtn} onPress={() => remove(i)} hitSlop={8}>
                  <X size={12} color="#fff" />
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {images.length < maxImages && (
        <Pressable
          style={[styles.addBtn, uploading && styles.addBtnDisabled]}
          onPress={pick}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={Colors.textSecondary} />
          ) : (
            <ImagePlus size={18} color={Colors.textSecondary} />
          )}
          <Text style={styles.addBtnText}>
            {uploading ? 'Subiendo...' : `Añadir imágenes (${images.length}/${maxImages})`}
          </Text>
        </Pressable>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  scroll:    { marginHorizontal: -4 },
  thumbRow:  { flexDirection: 'row', gap: 8, paddingHorizontal: 4 },
  thumbWrap: { position: 'relative' },
  thumb:     { width: 80, height: 80, borderRadius: 10, backgroundColor: Colors.border },
  removeBtn: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10, padding: 3,
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderWidth: 1,
    borderColor: Colors.border, borderStyle: 'dashed',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
  },
  addBtnDisabled: { opacity: 0.5 },
  addBtnText: { color: Colors.textSecondary, fontSize: 14 },
  error: { color: Colors.error, fontSize: 12 },
});
