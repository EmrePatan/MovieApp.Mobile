import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const genres = taste.genres.slice(0, 6);
  const dominantGenre = genres[0]?.name ?? null;

  return (
    <View style={styles.section}>
      <InsightsSectionHeader
        title="Your Taste"
        subtitle={dominantGenre ? formatDominantGenreHeadline(dominantGenre) : undefined}
      />
      {genres.length === 0 ? (
        <InsightsEmptyState message="Not enough history yet to map your taste." />
      ) : (
        <View style={styles.card}>
          {genres.map((genre) => (
            <InsightsAffinityBar
              key={genre.genreId}
              label={genre.name}
              percent={genre.sharePercent}
              accessibilityLabel={`${genre.name}, ${Math.round(genre.sharePercent)} percent`}
            />
          ))}
          {taste.risingGenre ? (
            <View style={styles.risingCard} testID="insights-rising-genre">
              <View style={styles.risingIcon}>
                <Ionicons name="trending-up-outline" size={16} color={colors.accent} />
              </View>
              <View style={styles.risingCopy}>
                <AppText variant="caption" muted style={styles.risingLabel}>
                  Rising taste
                </AppText>
                <AppText variant="bodySmall" style={styles.risingTitle}>
                  {taste.risingGenre.name}
                </AppText>
                <AppText variant="caption" muted>
                  +{Math.round(taste.risingGenre.shareDeltaPercent)} pts since last year
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
    gap: spacing.md,
  },
  risingCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  risingIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentTint12,
  },
  risingCopy: {
    flex: 1,
    gap: 2,
  },
  risingLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  risingTitle: {
    color: colors.accentStrong,
    fontWeight: '600',
  },
});
