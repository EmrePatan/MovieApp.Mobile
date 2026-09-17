import { memo, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/spacing';

interface BackdropImageProps {
  path: string | null | undefined;
  height?: number;
}

export const BackdropImage = memo(function BackdropImage({
  path,
  height = 220,
}: BackdropImageProps) {
  const [hasError, setHasError] = useState(false);
  const [trackedPath, setTrackedPath] = useState(path);
  const uri = resolveImageUri(path);

  if (trackedPath !== path) {
    setTrackedPath(path);
    setHasError(false);
  }

  if (!uri || hasError) {
    return (
      <View style={[styles.fallback, { height }]} accessibilityRole="image">
        <Ionicons name="film-outline" size={40} color={colors.textMuted} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.image, { height }]}
      resizeMode="cover"
      accessibilityRole="image"
      onError={() => setHasError(true)}
    />
  );
});

interface CatalogImageProps {
  path: string | null | undefined;
  width: number;
  height: number;
  accessibilityLabel?: string;
  rounded?: boolean;
}

export const CatalogImage = memo(function CatalogImage({
  path,
  width,
  height,
  accessibilityLabel,
  rounded = true,
}: CatalogImageProps) {
  const [hasError, setHasError] = useState(false);
  const [trackedPath, setTrackedPath] = useState(path);
  const uri = resolveImageUri(path);
  const showFallback = !uri || hasError;

  if (trackedPath !== path) {
    setTrackedPath(path);
    setHasError(false);
  }

  return (
    <View
      style={[
        styles.imageContainer,
        rounded && styles.rounded,
        { width, height },
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
    >
      {showFallback ? (
        <View style={styles.fallbackInner}>
          <Ionicons name="film-outline" size={28} color={colors.textMuted} />
        </View>
      ) : (
        <Image
          source={{ uri }}
          style={[styles.image, rounded && styles.rounded, { width, height }]}
          resizeMode="cover"
          onError={() => setHasError(true)}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  image: {
    width: '100%',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  imageContainer: {
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
  },
  rounded: {
    borderRadius: borderRadius.md,
  },
  fallbackInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
});
