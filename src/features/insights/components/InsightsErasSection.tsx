import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { InsightsV3Era } from '../types';
import { formatDecadeLabel } from '../utils/insights-format';
import { authTypography } from '@/features/auth/auth-typography';
import { InsightsCard } from './InsightsCard';
import { InsightsEmptyState } from './InsightsEmptyState';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsErasSectionProps {
  era: InsightsV3Era;
}

export function InsightsErasSection({ era }: InsightsErasSectionProps) {
  const { t } = useTranslation();
  const knownDecades = era.decades.filter((bucket) => bucket.count > 0);
  const hasKnownEras = knownDecades.length > 0;
  const maxCount = Math.max(...knownDecades.map((bucket) => bucket.count), 1);

  return (
    <View style={styles.section}>
      <InsightsSectionHeader
        title={t('insights.eras.title')}
        subtitle={t('insights.eras.subtitle')}
        index={5}
      />
      {!hasKnownEras ? (
        <InsightsEmptyState message={t('insights.eras.empty')} />
      ) : (
        <InsightsCard style={styles.body}>
          {era.favoriteDecade ? (
            <AppText variant="bodySmall" style={styles.favoriteCopy}>
              {t('insights.eras.favoriteDecade', { decade: era.favoriteDecade })}
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
              {t('insights.eras.unknownMetadata', { count: era.unknownCount })}
            </AppText>
          ) : null}
        </InsightsCard>
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
    padding: spacing.md,
  },
  favoriteCopy: {
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 17,
    lineHeight: 24,
    color: colors.accentStrong,
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
    backgroundColor: glass.panelElevated,
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
