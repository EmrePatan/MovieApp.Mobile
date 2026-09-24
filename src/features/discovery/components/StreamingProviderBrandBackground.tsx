import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getStreamingProviderBrandTheme } from '@/features/discovery/streaming-provider-brand';
import { borderRadius } from '@/theme/spacing';

interface StreamingProviderBrandBackgroundProps {
  providerId: number;
}

/** Layered cinematic background for platform brand tiles and heroes. */
export function StreamingProviderBrandBackground({
  providerId,
}: StreamingProviderBrandBackgroundProps) {
  const theme = getStreamingProviderBrandTheme(providerId);

  return (
    <>
      <LinearGradient
        colors={[...theme.base]}
        locations={[...theme.baseLocations]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[theme.mesh, 'transparent', theme.glow]}
        locations={[0, 0.45, 1]}
        start={{ x: 1, y: 0.1 }}
        end={{ x: 0, y: 0.9 }}
        style={styles.mesh}
      />
      <LinearGradient
        colors={[theme.glow, 'transparent']}
        locations={[0, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.75, y: 0.65 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', theme.beam, 'transparent']}
        locations={[0.15, 0.5, 0.85]}
        start={{ x: 0, y: 0.4 }}
        end={{ x: 1, y: 0.6 }}
        style={styles.beam}
      />
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.16)', 'transparent']}
        locations={[0, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.42 }}
        style={styles.topSheen}
      />
      <LinearGradient
        colors={['transparent', theme.mesh, theme.backdropBottom]}
        locations={[0.35, 0.72, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.edge, { borderColor: theme.edge }]} pointerEvents="none" />
    </>
  );
}

const styles = StyleSheet.create({
  mesh: {
    ...StyleSheet.absoluteFill,
    opacity: 0.9,
  },
  beam: {
    position: 'absolute',
    left: '-15%',
    right: '-15%',
    top: '28%',
    height: '38%',
    opacity: 0.55,
    transform: [{ rotate: '-14deg' }],
  },
  topSheen: {
    ...StyleSheet.absoluteFill,
    opacity: 0.75,
  },
  edge: {
    ...StyleSheet.absoluteFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: borderRadius.md,
  },
});
