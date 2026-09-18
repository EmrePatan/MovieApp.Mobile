import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { InsightsV3Era } from '../types';
import { InsightsAffinityBar } from './InsightsAffinityBar';
import { InsightsEmptyState } from './InsightsEmptyState';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface InsightsErasSectionProps {
  era: InsightsV3Era;
}

export function InsightsErasSection({ era }: InsightsErasSectionProps) {
  const knownDecades = era.decades.filter((bucket) => bucket.count > 0);
  const hasKnownEras = knownDecades.length > 0;

  return (
    <View style={styles.section}>
      <InsightsSectionHeader title="Your Era" subtitle="The decades your watch history spans" />
      {!hasKnownEras ? (
        <InsightsEmptyState message="Not enough release-year data to chart your eras yet." />
      ) : (
        <View style={styles.card}>
          {era.favoriteDecade ? (
            <View style={styles.favoriteBlock}>
              <AppText variant="caption" muted>Favorite decade</AppText>
              <AppText variant="title" style={styles.favoriteDecade}>
                {era.favoriteDecade}
              </AppText>
            </View>
          ) : null}
          {era.decades.map((bucket) => (
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
          {era.oldestTitle ? (
            <View style={styles.oldestRow} testID="insights-oldest-title">
              <PosterImage uri={era.oldestTitle.posterPath} width={44} height={66} />
              <View style={styles.oldestCopy}>
                <AppText variant="caption" muted>Oldest watched</AppText>
                <AppText variant="bodySmall" style={styles.oldestTitle}>
                  {era.oldestTitle.title}
                </AppText>
                {era.oldestTitle.year ? (
                  <AppText variant="caption" muted>{era.oldestTitle.year}</AppText>
                ) : null}
              </View>
            </View>
          ) : null}
          {era.unknownCount > 0 ? (
            <AppText variant="caption" muted>
              {era.unknownCount} watched titles are missing release-year metadata.
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
    gap: spacing.md,
  },
  favoriteBlock: {
    gap: 2,
  },
  favoriteDecade: {
    color: colors.accentStrong,
  },
  oldestRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  oldestCopy: {
    flex: 1,
    gap: 2,
  },
  oldestTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
