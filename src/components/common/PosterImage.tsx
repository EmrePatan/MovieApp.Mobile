import { memo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { DetailDirectionalFrame } from '@/features/details/shared/components/DetailDirectionalFrame';
import { DETAIL_DIRECTIONAL_FRAME_BORDER } from '@/features/details/shared/detailDirectionalFrame';
import { useRemoteImageLoadState } from '@/hooks/useRemoteImageLoadState';
import { REMOTE_IMAGE_CACHE_POLICY } from '@/utils/cached-image';
import { resolveImageUri, type ImageSize } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/spacing';
import { shadows } from '@/theme/shadows';

/**
 * surfaceElevated (#1C1C28) at 40%. A decoded bitmap stays visible while JS
 * is still waiting on onLoad — an opaque veil is what made cached posters
 * look like blank cards with spinners.
 */
export const POSTER_LOADING_VEIL = 'rgba(28, 28, 40, 0.4)';

interface PosterImageProps {
  uri: string | null | undefined;
  width: number;
  height: number;
  accessibilityLabel?: string;
  elevated?: boolean;
  directionalFrame?: boolean;
  directionalFrameGlow?: boolean;
  /** Stable identity for recycled list cells; defaults to resolved URI. */
  imageStateKey?: string;
  /** TMDB size profile. Defaults to w500, matching catalog and New Releases rows. */
  size?: ImageSize;
}

export const PosterImage = memo(function PosterImage({
  uri,
  width,
  height,
  accessibilityLabel,
  elevated = false,
  directionalFrame = false,
  directionalFrameGlow = false,
  imageStateKey,
  size,
}: PosterImageProps) {
  const resolvedUri = resolveImageUri(uri, size);
  const stateKey = imageStateKey ?? resolvedUri;
  const { hasError, imageKey, onImageError, onImageLoad, onImageLoadEnd } =
    useRemoteImageLoadState(stateKey);
  const showFallback = !resolvedUri || hasError;
  const [trackedUri, setTrackedUri] = useState(resolvedUri);
  const [isLoading, setIsLoading] = useState(Boolean(resolvedUri));
  const resolvedUriRef = useRef(resolvedUri);
  resolvedUriRef.current = resolvedUri;

  const clearLoadingIfCurrent = (uriAtEvent: string | null) => {
    if (resolvedUriRef.current === uriAtEvent) {
      setIsLoading(false);
    }
  };

  const innerWidth = directionalFrame ? width - DETAIL_DIRECTIONAL_FRAME_BORDER * 2 : width;
  const innerHeight = directionalFrame ? height - DETAIL_DIRECTIONAL_FRAME_BORDER * 2 : height;
  const innerRadius = directionalFrame
    ? Math.max(0, borderRadius.md - DETAIL_DIRECTIONAL_FRAME_BORDER)
    : borderRadius.md;

  if (trackedUri !== resolvedUri) {
    setTrackedUri(resolvedUri);
    setIsLoading(Boolean(resolvedUri));
  }

  const markDisplayed = () => {
    const uriAtEvent = resolvedUri;
    onImageLoad();
    clearLoadingIfCurrent(uriAtEvent);
  };

  const handleLoadEnd = () => {
    const uriAtEvent = resolvedUri;
    onImageLoadEnd();
    clearLoadingIfCurrent(uriAtEvent);
  };

  const handleError = () => {
    const uriAtEvent = resolvedUri;
    onImageError();
    clearLoadingIfCurrent(uriAtEvent);
  };

  const posterBody = (
    <View
      style={[
        styles.container,
        { width: innerWidth, height: innerHeight, borderRadius: innerRadius },
        !directionalFrame && elevated && shadows.poster,
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
            source={{ uri: resolvedUri }}
            style={[styles.image, { width: innerWidth, height: innerHeight, borderRadius: innerRadius }]}
            contentFit="cover"
            cachePolicy={REMOTE_IMAGE_CACHE_POLICY}
            recyclingKey={imageKey}
            transition={null}
            onLoad={markDisplayed}
            onDisplay={markDisplayed}
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

  if (!directionalFrame) {
    return posterBody;
  }

  return (
    <DetailDirectionalFrame
      variant="gold"
      borderRadius={borderRadius.md}
      glow={directionalFrameGlow}
      style={{ width, height }}
    >
      {posterBody}
    </DetailDirectionalFrame>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
  },
  image: {},
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
    backgroundColor: POSTER_LOADING_VEIL,
  },
});
