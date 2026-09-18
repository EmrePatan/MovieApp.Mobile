import { StyleSheet, View } from 'react-native';
import type { InsightsV3Taste } from '../types';
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

  return (
    <View style={styles.section}>
      <InsightsSectionHeader title="Your Taste" subtitle="The genres that define your history" />
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
              <AppText variant="caption" muted style={styles.risingLabel}>
                Rising this year
              </AppText>
              <AppText variant="bodySmall" style={styles.risingTitle}>
                {taste.risingGenre.name}
              </AppText>
              <AppText variant="caption" muted>
                {Math.round(taste.risingGenre.shareDeltaPercent)} pts since last year
              </AppText>
            </View>
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
  risingCard: {
    gap: 2,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
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
