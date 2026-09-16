import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme/colors';

export function AuthAtmosphere() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['rgba(196, 163, 90, 0.22)', 'rgba(196, 163, 90, 0.04)', 'rgba(10, 10, 15, 0)']}
        locations={[0, 0.45, 1]}
        style={styles.topGlow}
      />
      <LinearGradient
        colors={['rgba(10, 10, 15, 0)', 'rgba(155, 123, 212, 0.08)', 'rgba(10, 10, 15, 0.95)']}
        locations={[0, 0.55, 1]}
        style={styles.bottomGlow}
      />
      <View style={styles.perforationRow}>
        {PERFORATION_SLOTS.map((slot) => (
          <View key={slot} style={styles.perforation} />
        ))}
      </View>
    </View>
  );
}

const PERFORATION_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const styles = StyleSheet.create({
  topGlow: {
    position: 'absolute',
    top: -120,
    left: -40,
    right: -40,
    height: 320,
  },
  bottomGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 280,
  },
  perforationRow: {
    position: 'absolute',
    top: 18,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    opacity: 0.35,
  },
  perforation: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.accentMuted,
  },
});
