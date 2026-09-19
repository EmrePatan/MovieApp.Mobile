import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { InsightsV3Taste } from '../types';
import { formatDominantGenreHeadline } from '../utils/insights-format';
import { InsightsAffinityBar } from './InsightsAffinityBar';
import { InsightsEmptyState } from './InsightsEmptyState';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsTasteSectionProps {
  taste: InsightsV3Taste;
}

export function InsightsTasteSection({ taste }: InsightsTasteSectionProps) {
  const { t } = useTranslation();
  const genres = taste.genres.slice(0, 4);
  const dominantGenre = genres[0]?.name ?? null;

  return (
    <View style={styles.section}>
      <InsightsSectionHeader
        title={t('insights.taste.title')}
        subtitle={dominantGenre ? formatDominantGenreHeadline(dominantGenre) : undefined}
      />
      {genres.length === 0 ? (
        <InsightsEmptyState message={t('insights.taste.empty')} />
      ) : (
        <View style={styles.card}>
          {genres.map((genre, index) => (
            <InsightsAffinityBar
              key={genre.genreId}
              label={genre.name}
              percent={genre.sharePercent}
              compact
              emphasize={index === 0}
              accessibilityLabel={t('insights.taste.affinityAccessibility', {
                genre: genre.name,
                percent: Math.round(genre.sharePercent),
              })}
            />
          ))}
          {taste.risingGenre ? (
            <View style={styles.risingCard} testID="insights-rising-genre">
              <View style={styles.risingIcon}>
                <Ionicons name="trending-up-outline" size={14} color={colors.accent} />
              </View>
              <View style={styles.risingCopy}>
                <AppText variant="caption" muted style={styles.risingLabel}>
                  {t('insights.taste.risingTaste')}
                </AppText>
                <AppText variant="bodySmall" style={styles.risingTitle}>
                  {taste.risingGenre.name}
                </AppText>
                <AppText variant="caption" muted>
                  {t('insights.taste.risingDelta', {
                    points: Math.round(taste.risingGenre.shareDeltaPercent),
                  })}
                </AppText>
              </View>
            </View>
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
  card: {
    gap: spacing.sm,
  },
  risingCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  risingIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentTint12,
  },
  risingCopy: {
    flex: 1,
    gap: 1,
  },
  risingLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 10,
  },
  risingTitle: {
    color: colors.accentStrong,
    fontWeight: '600',
  },
});
