import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { InsightsV3Era } from '../types';
import { formatDecadeLabel } from '../utils/insights-format';
import { InsightsEmptyState } from './InsightsEmptyState';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsErasSectionProps {
  era: InsightsV3Era;
}

export function InsightsErasSection({ era }: InsightsErasSectionProps) {
  const knownDecades = era.decades.filter((bucket) => bucket.count > 0);
  const hasKnownEras = knownDecades.length > 0;
  const maxCount = Math.max(...knownDecades.map((bucket) => bucket.count), 1);

  return (
    <View style={styles.section}>
      <InsightsSectionHeader title="Your Era" subtitle="The decades your watch history spans" />
      {!hasKnownEras ? (
        <InsightsEmptyState message="Not enough release-year data to chart your eras yet." />
      ) : (
        <View style={styles.body}>
          {era.favoriteDecade ? (
            <AppText variant="bodySmall" style={styles.favoriteCopy}>
              <AppText variant="bodySmall" style={styles.favoriteDecade}>{era.favoriteDecade}</AppText>
              {' '}is your most-watched decade
            </AppText>
          ) : null}

          <View style={styles.timeline} accessibilityRole="summary">
            {era.decades.map((bucket) => {
              const isFavorite = bucket.bucket === era.favoriteDecade;
              const heightPercent = bucket.count > 0
                ? Math.max(12, (bucket.count / maxCount) * 100)
                : 6;
              return (
                <View key={bucket.bucket} style={styles.timelineColumn}>
                  <View style={styles.timelineTrack}>
                    <View
                      style={[
                        styles.timelineFill,
                        { height: `${heightPercent}%` },
                        isFavorite && styles.timelineFillFavorite,
                      ]}
                    />
                  </View>
                  <AppText
                    variant="caption"
                    muted
                    style={[styles.decadeLabel, isFavorite && styles.decadeLabelFavorite]}
                    numberOfLines={1}
                  >
                    {formatDecadeLabel(bucket.bucket)}
                  </AppText>
                </View>
              );
            })}
          </View>

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
    gap: spacing.xs,
  },
  body: {
    gap: spacing.sm,
  },
  favoriteCopy: {
    lineHeight: 20,
    color: colors.textMuted,
  },
  favoriteDecade: {
    color: colors.accentStrong,
    fontWeight: '700',
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.xs,
    minHeight: 112,
  },
  timelineColumn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 0,
  },
  timelineTrack: {
    width: '100%',
    height: 88,
    justifyContent: 'flex-end',
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  timelineFill: {
    width: '100%',
    backgroundColor: colors.accentMuted,
    borderTopLeftRadius: borderRadius.sm,
    borderTopRightRadius: borderRadius.sm,
  },
  timelineFillFavorite: {
    backgroundColor: colors.accent,
  },
  decadeLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  decadeLabelFavorite: {
    color: colors.accentStrong,
    fontWeight: '600',
  },
});
