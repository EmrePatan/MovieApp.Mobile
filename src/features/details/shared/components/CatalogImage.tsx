import { memo } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRemoteImageState } from '@/hooks/useRemoteImageState';
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
  const uri = resolveImageUri(path);
  const { isLoading, showFallback, markLoading, markLoaded, markError } =
    useRemoteImageState(uri);

  if (showFallback) {
    return (
      <View style={[styles.fallback, { height }]} accessibilityRole="image">
        <Ionicons name="film-outline" size={40} color={colors.textMuted} />
      </View>
    );
  }

  return (
    <View style={{ height }} accessibilityRole="image">
      <Image
        source={{ uri: uri! }}
        style={[styles.image, { height }]}
        resizeMode="cover"
        onLoadStart={markLoading}
        onLoad={markLoaded}
        onLoadEnd={markLoaded}
        onError={markError}
      />
      {isLoading ? (
        <View style={[styles.loadingOverlay, { height }]}>
          <ActivityIndicator color={colors.textMuted} size="small" />
        </View>
      ) : null}
    </View>
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
  const uri = resolveImageUri(path);
  const { isLoading, showFallback, markLoading, markLoaded, markError } =
    useRemoteImageState(uri);

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
        <>
          <Image
            source={{ uri: uri! }}
            style={[styles.image, rounded && styles.rounded, { width, height }]}
            resizeMode="cover"
            onLoadStart={markLoading}
            onLoad={markLoaded}
            onLoadEnd={markLoaded}
            onError={markError}
          />
          {isLoading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={colors.textMuted} size="small" />
            </View>
          ) : null}
        </>
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
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
});
