import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { GenreStatisticResponse } from '../types';
import { getGenrePercentage } from '../utils/profile-analytics';
import { ProfileBarRow } from './ProfileBarRow';
import { ProfileEmptyInsight } from './ProfileEmptyInsight';
import { ProfileSectionHeader } from './ProfileSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface ProfileTasteSectionProps {
  genres: GenreStatisticResponse[];
}

export function ProfileTasteSection({ genres }: ProfileTasteSectionProps) {
  if (genres.length === 0) {
    return (
      <View style={styles.section}>
        <ProfileSectionHeader title="Your Taste" subtitle="Genres from titles you have watched" />
        <ProfileEmptyInsight message="Your favorite genres will appear here as you watch." />
      </View>
    );
  }

  const total = genres.reduce((sum, genre) => sum + genre.count, 0);
  const topGenres = genres.slice(0, 4);
  const insight =
    topGenres.length >= 2
      ? `${topGenres[0].name} and ${topGenres[1].name} are your top genres.`
      : `${topGenres[0].name} is your top genre.`;

  return (
    <View style={styles.section}>
      <ProfileSectionHeader title="Your Taste" subtitle="Genres from titles you have watched" />
      <View style={styles.card}>
        {topGenres.map((genre) => {
          const percent = getGenrePercentage(genre.count, total);
          return (
            <ProfileBarRow
              key={genre.genreId}
              label={genre.name}
              valueLabel={`${percent}%`}
              progress={percent / 100}
              accessibilityLabel={`${genre.name}: ${percent} percent of watched titles.`}
              accentColor={colors.accent}
            />
          );
        })}
        <AppText variant="caption" muted style={styles.insight}>
          {insight}
        </AppText>
      </View>
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
    padding: spacing.sm,
    gap: spacing.sm,
  },
  insight: {
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
