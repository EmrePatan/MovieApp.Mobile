import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { glass } from '@/theme/glass';
import { spacing } from '@/theme/spacing';

interface InsightsCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Faint gold light falling from the top edge, for the card that leads a section. */
  glow?: boolean;
}

/** Shared Liquid Glass surface for every insights section: radius 24, hairline edge. */
export function InsightsCard({ children, style, glow = false }: InsightsCardProps) {
  return (
    <View style={[styles.card, style]}>
      {glow ? (
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(212, 179, 106, 0.16)', 'rgba(212, 179, 106, 0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.7 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: glass.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.hairline,
  },
});
