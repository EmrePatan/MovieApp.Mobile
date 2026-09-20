import { Image, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';
import { MOVIE_CAVE_HEADER_LOGO } from '../movie-cave-logo-asset';

interface MovieCaveLogoProps {
  width: number;
  height: number;
  overlay?: boolean;
  style?: StyleProp<ImageStyle>;
}

export function MovieCaveLogo({ width, height, overlay = false, style }: MovieCaveLogoProps) {
  return (
    <Image
      source={MOVIE_CAVE_HEADER_LOGO}
      style={[styles.logo, { width, height }, overlay && styles.overlay, style]}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'flex-start',
  },
  overlay: {
    opacity: 0.96,
  },
});
