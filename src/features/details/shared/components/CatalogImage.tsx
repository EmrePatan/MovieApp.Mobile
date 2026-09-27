import { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRemoteImageLoadState } from '@/hooks/useRemoteImageLoadState';
import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/spacing';
import { DETAIL_DIRECTIONAL_FRAME_BORDER } from '../detailDirectionalFrame';
import { DetailDirectionalFrame } from './DetailDirectionalFrame';

interface BackdropImageProps {
  path: string | null | undefined;
  height?: number;
}

export const BackdropImage = memo(function BackdropImage({
  path,
  height = 220,
}: BackdropImageProps) {
  const uri = resolveImageUri(path);
  const { hasError, imageKey, onImageError, onImageLoad, onImageLoadEnd } =
    useRemoteImageLoadState(uri);

  if (!uri || hasError) {
    return (
      <View style={[styles.fallback, { height }]} accessibilityRole="image">
        <Ionicons name="film-outline" size={40} color={colors.textMuted} />
      </View>
    );
  }

  return (
    <Image
      key={imageKey}
      source={{ uri }}
      style={[styles.image, { height }]}
      resizeMode="cover"
      accessibilityRole="image"
      onError={onImageError}
      onLoad={onImageLoad}
      onLoadEnd={onImageLoadEnd}
    />
  );
});

interface CatalogImageProps {
  path: string | null | undefined;
  width: number;
  height: number;
  accessibilityLabel?: string;
  rounded?: boolean;
  directionalFrame?: boolean;
  directionalFrameGlow?: boolean;
}

export const CatalogImage = memo(function CatalogImage({
  path,
  width,
  height,
  accessibilityLabel,
  rounded = true,
  directionalFrame = false,
  directionalFrameGlow = false,
}: CatalogImageProps) {
  const uri = resolveImageUri(path);
  const { hasError, imageKey, onImageError, onImageLoad, onImageLoadEnd } =
    useRemoteImageLoadState(uri);
  const showFallback = !uri || hasError;

  const outerRadius = rounded ? borderRadius.md : 0;
  const innerWidth = directionalFrame ? width - DETAIL_DIRECTIONAL_FRAME_BORDER * 2 : width;
  const innerHeight = directionalFrame ? height - DETAIL_DIRECTIONAL_FRAME_BORDER * 2 : height;
  const innerRadius = directionalFrame
    ? Math.max(0, outerRadius - DETAIL_DIRECTIONAL_FRAME_BORDER)
    : outerRadius;

  const imageBody = (
    <View
      style={[
        styles.imageContainer,
        rounded && innerRadius > 0 && { borderRadius: innerRadius },
        { width: innerWidth, height: innerHeight },
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
          key={imageKey}
          source={{ uri }}
          style={[
            styles.image,
            rounded && innerRadius > 0 && { borderRadius: innerRadius },
            { width: innerWidth, height: innerHeight },
          ]}
          resizeMode="cover"
          onError={onImageError}
          onLoad={onImageLoad}
          onLoadEnd={onImageLoadEnd}
        />
      )}
    </View>
  );

  if (!directionalFrame) {
    return imageBody;
  }

  return (
    <DetailDirectionalFrame
      variant="gold"
      borderRadius={outerRadius}
      glow={directionalFrameGlow}
      style={{ width, height }}
    >
      {imageBody}
    </DetailDirectionalFrame>
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
  fallbackInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
});
