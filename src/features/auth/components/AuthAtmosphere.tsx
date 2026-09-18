import { ImageBackground, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authCinemaBackground } from '../auth-assets';

// Pan/zoom the cover crop so red seats and popcorn stay visible on the right
// while keeping the left side dark for hero/form readability across phone widths.
const BACKGROUND_SCALE = 0.96;
const BACKGROUND_TRANSLATE_X_RATIO = -0.055;
const BACKGROUND_TRANSLATE_Y_RATIO = -0.015;

export function AuthAtmosphere() {
  const { width, height } = useWindowDimensions();
  const imageFrameStyle = {
    transform: [
      { scale: BACKGROUND_SCALE },
      { translateX: width * BACKGROUND_TRANSLATE_X_RATIO },
      { translateY: height * BACKGROUND_TRANSLATE_Y_RATIO },
    ],
  };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <ImageBackground
        source={authCinemaBackground}
        resizeMode="cover"
        style={styles.image}
        imageStyle={imageFrameStyle}
      >
        {/* Left-to-right readability scrim — lighter on the right so seats/popcorn read through. */}
        <LinearGradient
          colors={[
            'rgba(6, 5, 8, 0.82)',
            'rgba(10, 8, 12, 0.58)',
            'rgba(14, 10, 14, 0.2)',
            'rgba(8, 6, 10, 0.05)',
          ]}
          locations={[0, 0.34, 0.68, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Vertical balance — deeper blacks behind the form/footer without crushing the hero. */}
        <LinearGradient
          colors={['rgba(6, 5, 8, 0.36)', 'transparent', 'rgba(4, 3, 6, 0.7)']}
          locations={[0, 0.48, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Localized form/footer scrim — cinematic black, not amber wash. */}
        <LinearGradient
          colors={['transparent', 'rgba(4, 3, 6, 0.42)', 'rgba(6, 5, 8, 0.62)']}
          locations={[0.5, 0.76, 1]}
          start={{ x: 0, y: 0.55 }}
          end={{ x: 0.72, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Warm spill from upper-left theater lighting. */}
        <LinearGradient
          colors={[
            'rgba(212, 179, 106, 0.15)',
            'rgba(196, 163, 90, 0.06)',
            'transparent',
          ]}
          locations={[0, 0.32, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.58, y: 0.42 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Tight lower-left light leak — edge only, not a broad wash. */}
        <LinearGradient
          colors={['transparent', 'transparent', 'rgba(196, 163, 90, 0.07)', 'rgba(212, 179, 106, 0.09)']}
          locations={[0, 0.58, 0.86, 1]}
          start={{ x: 0.95, y: 0.62 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Tight lower-right light leak — preserves popcorn/seat edge glow. */}
        <LinearGradient
          colors={['transparent', 'transparent', 'rgba(212, 179, 106, 0.05)', 'rgba(196, 163, 90, 0.08)']}
          locations={[0, 0.6, 0.88, 1]}
          start={{ x: 0.05, y: 0.65 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Gentle top vignette — warm, not flat black. */}
        <LinearGradient
          colors={['rgba(18, 12, 8, 0.22)', 'transparent']}
          locations={[0, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.4 }}
          style={styles.topVignette}
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topVignette: {
    ...StyleSheet.absoluteFill,
  },
});
