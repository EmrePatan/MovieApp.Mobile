import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { InsightsEras } from '../types';
import { InsightsAffinityBar } from './InsightsAffinityBar';
import { InsightsEmptyState } from './InsightsEmptyState';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsErasSectionProps {
  eras: InsightsEras;
}

export function InsightsErasSection({ eras }: InsightsErasSectionProps) {
  const knownBuckets = eras.buckets.filter((bucket) => bucket.percent != null && bucket.count > 0);
  const hasKnownEras = knownBuckets.length > 0;

  return (
    <View style={styles.section}>
      <InsightsSectionHeader title="Your Eras" subtitle="Release decades in your watch history" />
      {!hasKnownEras ? (
        <InsightsEmptyState message="Not enough release-year data to chart your eras yet." />
      ) : (
        <View style={styles.card}>
          {eras.buckets.map((bucket) => (
            <InsightsAffinityBar
              key={bucket.bucket}
              label={bucket.bucket}
              percent={bucket.percent ?? 0}
              detail={bucket.percent != null ? `${Math.round(bucket.percent)}% · ${bucket.count}` : `${bucket.count}`}
              accessibilityLabel={
                bucket.percent != null
                  ? `${bucket.bucket}, ${Math.round(bucket.percent)} percent, ${bucket.count} titles`
                  : `${bucket.bucket}, ${bucket.count} titles`
              }
            />
          ))}
          {eras.unknownCount > 0 ? (
            <AppText variant="caption" muted style={styles.unknownNote}>
              {eras.unknownCount} watched titles are missing release-year metadata.
            </AppText>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  unknownNote: {
    paddingTop: spacing.xs,
  },
});
