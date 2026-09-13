import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface ProfileBarRowProps {
  label: string;
  valueLabel: string;
  progress: number;
  accessibilityLabel: string;
  accentColor?: string;
}

export function ProfileBarRow({
  label,
  valueLabel,
  progress,
  accessibilityLabel,
  accentColor = colors.accent,
}: ProfileBarRowProps) {
  const clamped = Math.max(0, Math.min(progress, 1));

  return (
    <View style={styles.container} accessibilityRole="text" accessibilityLabel={accessibilityLabel}>
      <View style={styles.meta}>
        <AppText variant="bodySmall" style={styles.label}>
          {label}
        </AppText>
        <AppText variant="caption" muted>
          {valueLabel}
        </AppText>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: accentColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  track: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
