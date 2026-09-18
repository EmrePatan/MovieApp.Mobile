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
            'rgba(6, 5, 8, 0.78)',
            'rgba(10, 8, 12, 0.56)',
            'rgba(14, 10, 14, 0.2)',
            'rgba(8, 6, 10, 0.05)',
          ]}
          locations={[0, 0.34, 0.68, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Vertical balance — soften the bottom crush while keeping the hero area legible. */}
        <LinearGradient
          colors={['rgba(6, 5, 8, 0.38)', 'transparent', 'rgba(6, 5, 8, 0.58)']}
          locations={[0, 0.44, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Warm ceiling spill from the theater lights above. */}
        <LinearGradient
          colors={[
            'rgba(212, 179, 106, 0.16)',
            'rgba(196, 163, 90, 0.08)',
            'transparent',
          ]}
          locations={[0, 0.28, 0.62]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Soft gold bloom from the lower-left aisle lighting. */}
        <LinearGradient
          colors={['transparent', 'rgba(196, 163, 90, 0.1)', 'rgba(212, 179, 106, 0.14)']}
          locations={[0.3, 0.68, 1]}
          start={{ x: 1, y: 0.15 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Soft gold bloom from the lower-right popcorn/seat glow. */}
        <LinearGradient
          colors={['transparent', 'rgba(212, 179, 106, 0.08)', 'rgba(196, 163, 90, 0.12)']}
          locations={[0.35, 0.72, 1]}
          start={{ x: 0, y: 0.1 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Gentle top vignette — warm, not flat black. */}
        <LinearGradient
          colors={['rgba(18, 12, 8, 0.24)', 'transparent']}
          locations={[0, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.42 }}
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
