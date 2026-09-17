import { StyleSheet, View } from 'react-native';
import type { InsightsTaste } from '../types';
import { InsightsAffinityBar } from './InsightsAffinityBar';
import { InsightsEmptyState } from './InsightsEmptyState';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsTasteSectionProps {
  taste: InsightsTaste;
}

export function InsightsTasteSection({ taste }: InsightsTasteSectionProps) {
  const genres = taste.genres.slice(0, 6);

  return (
    <View style={styles.section}>
      <InsightsSectionHeader title="Your Taste" subtitle="Top genre affinities from your history" />
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
});
