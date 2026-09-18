import { ImageBackground, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { homeCinemaBackground } from '../home-assets';

export function HomeAtmosphere() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <ImageBackground
        source={homeCinemaBackground}
        resizeMode="cover"
        style={styles.image}
        imageStyle={styles.imageFrame}
      >
        <LinearGradient
          colors={['rgba(6, 5, 8, 0.82)', 'rgba(6, 5, 8, 0.58)', 'rgba(6, 5, 8, 0.9)']}
          locations={[0, 0.5, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(6, 5, 8, 0.78)', 'transparent', 'rgba(6, 5, 8, 0.42)']}
          locations={[0, 0.45, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
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
  imageFrame: {
    width: '100%',
    height: '100%',
  },
});
