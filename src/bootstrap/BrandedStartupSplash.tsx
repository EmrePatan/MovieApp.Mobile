import { Image, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BRANDED_SPLASH_BACKGROUND } from './startup-splash-timing';

const MOVIE_CAVE_SPLASH_IMAGE = require('../../assets/splash/movie-cave-splash.png');

interface BrandedStartupSplashProps {
  onLayout?: (event: LayoutChangeEvent) => void;
}

export function BrandedStartupSplash({ onLayout }: BrandedStartupSplashProps) {
  return (
    <View style={styles.container} onLayout={onLayout} testID="branded-startup-splash">
      <StatusBar style="light" />
      <Image
        source={MOVIE_CAVE_SPLASH_IMAGE}
        style={styles.image}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
        accessible={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRANDED_SPLASH_BACKGROUND,
  },
  image: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
});
