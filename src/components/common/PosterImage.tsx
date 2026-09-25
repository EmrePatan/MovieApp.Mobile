import { memo, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRemoteImageLoadState } from '@/hooks/useRemoteImageLoadState';
import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/spacing';
import { shadows } from '@/theme/shadows';

interface PosterImageProps {
  uri: string | null | undefined;
  width: number;
  height: number;
  accessibilityLabel?: string;
  elevated?: boolean;
  /** Stable identity for recycled list cells; defaults to resolved URI. */
  imageStateKey?: string;
}

export const PosterImage = memo(function PosterImage({
  uri,
  width,
  height,
  accessibilityLabel,
  elevated = false,
  imageStateKey,
}: PosterImageProps) {
  const resolvedUri = resolveImageUri(uri);
  const stateKey = imageStateKey ?? resolvedUri;
  const { hasError, imageKey, onImageError, onImageLoad, onImageLoadEnd } =
    useRemoteImageLoadState(stateKey);
  const showFallback = !resolvedUri || hasError;
  const [trackedUri, setTrackedUri] = useState(resolvedUri);
  const [isLoading, setIsLoading] = useState(Boolean(resolvedUri));

  if (trackedUri !== resolvedUri) {
    setTrackedUri(resolvedUri);
    setIsLoading(Boolean(resolvedUri));
  }

  const handleLoad = () => {
    onImageLoad();
    setIsLoading(false);
  };

  const handleLoadEnd = () => {
    onImageLoadEnd();
    setIsLoading(false);
  };

  const handleError = () => {
    onImageError();
    setIsLoading(false);
  };

  return (
    <View
      style={[
        styles.container,
        { width, height },
        elevated && shadows.poster,
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
    >
      {showFallback ? (
        <View style={styles.fallback}>
          <Ionicons name="film-outline" size={28} color={colors.textMuted} />
        </View>
      ) : (
        <>
          <Image
            key={imageKey}
            source={{ uri: resolvedUri }}
            style={[styles.image, { width, height }]}
            resizeMode="cover"
            onLoad={handleLoad}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
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
  container: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
  },
  image: {
    borderRadius: borderRadius.md,
  },
  fallback: {
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
