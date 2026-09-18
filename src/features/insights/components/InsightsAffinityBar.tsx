import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsAffinityBarProps {
  label: string;
  percent: number;
  detail?: string;
  compact?: boolean;
  accessibilityLabel: string;
}

export function InsightsAffinityBar({
  label,
  percent,
  detail,
  compact = false,
  accessibilityLabel,
}: InsightsAffinityBarProps) {
  const widthPercent = Math.max(0, Math.min(100, percent));

  return (
    <View
      style={[styles.row, compact && styles.rowCompact]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.labelRow}>
        <AppText variant="bodySmall" numberOfLines={1} style={styles.label}>
          {label}
        </AppText>
        <AppText variant="caption" muted>
          {detail ?? `${Math.round(percent)}%`}
        </AppText>
      </View>
      <View style={[styles.track, compact && styles.trackCompact]}>
        <View style={[styles.fill, { width: `${widthPercent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.xs,
  },
  rowCompact: {
    gap: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  label: {
    flex: 1,
    color: colors.textPrimary,
  },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  trackCompact: {
    height: 7,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
});
