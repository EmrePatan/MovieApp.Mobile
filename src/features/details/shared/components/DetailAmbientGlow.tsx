import { memo } from 'react';
import { Image, Platform, StyleSheet, View, type ImageStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';

const GLOW_HEIGHT = 520;
const GLOW_BLUR_RADIUS = 48;
const GLOW_IMAGE_OPACITY = 0.42;

/** Web ignores `blurRadius`, so blur through CSS there. */
const webBlurStyle = (Platform.OS === 'web'
  ? { filter: `blur(${GLOW_BLUR_RADIUS}px)` }
  : null) as ImageStyle | null;

interface DetailAmbientGlowProps {
  /** Poster or backdrop path; the colours of the image become the screen's light. */
  path: string | null | undefined;
  /** Distance from the top of the hero at which the glow starts. */
  top?: number;
}

/**
 * Soft light taken from the title's own artwork. A heavily blurred copy of the
 * image sits behind the content and fades into the app background, so the glass
 * cards below pick up each film's colours without any colour extraction.
 */
export const DetailAmbientGlow = memo(function DetailAmbientGlow({
  path,
  top = 0,
}: DetailAmbientGlowProps) {
  const uri = resolveImageUri(path);

  if (!uri) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.host, { top }]}
      testID="detail-ambient-glow"
    >
      <Image
        source={{ uri }}
        style={[styles.image, webBlurStyle]}
        resizeMode="cover"
        blurRadius={GLOW_BLUR_RADIUS}
      />
      <LinearGradient
        colors={['rgba(5, 5, 8, 0.15)', colors.background]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: GLOW_HEIGHT,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: GLOW_IMAGE_OPACITY,
  },
});
