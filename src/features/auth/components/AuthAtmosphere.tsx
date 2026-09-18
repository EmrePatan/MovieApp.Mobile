import { ImageBackground, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authCinemaBackground } from '../auth-assets';

// Pan/zoom the cover crop so ~half the popcorn bucket enters from the right edge
// while keeping the left side dark for hero/form readability across phone widths.
const BACKGROUND_SCALE = 0.93;
const BACKGROUND_TRANSLATE_X_RATIO = -0.075;
const BACKGROUND_TRANSLATE_Y_RATIO = -0.02;

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
        <LinearGradient
          colors={[
            'rgba(6, 5, 8, 0.92)',
            'rgba(10, 8, 12, 0.78)',
            'rgba(14, 10, 14, 0.42)',
            'rgba(8, 6, 10, 0.18)',
          ]}
          locations={[0, 0.34, 0.68, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />

        <LinearGradient
          colors={['rgba(6, 5, 8, 0.55)', 'transparent', 'rgba(6, 5, 8, 0.82)']}
          locations={[0, 0.42, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <LinearGradient
          colors={['rgba(0, 0, 0, 0.35)', 'transparent']}
          locations={[0, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.45 }}
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
