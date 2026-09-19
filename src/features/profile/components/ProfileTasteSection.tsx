import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { translateGenreName } from '@/i18n/catalog-labels';
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
  const { t } = useTranslation();

  if (genres.length === 0) {
    return (
      <View style={styles.section}>
        <ProfileSectionHeader
          title={t('profile.preview.tasteTitle')}
          subtitle={t('profile.preview.tasteSubtitle')}
        />
        <ProfileEmptyInsight message={t('profile.preview.tasteEmpty')} />
      </View>
    );
  }

  const total = genres.reduce((sum, genre) => sum + genre.count, 0);
  const topGenres = genres.slice(0, 4);
  const insight =
    topGenres.length >= 2
      ? t('profile.preview.tasteTopPair', {
          first: translateGenreName(topGenres[0].name),
          second: translateGenreName(topGenres[1].name),
        })
      : t('profile.preview.tasteTopSingle', {
          genre: translateGenreName(topGenres[0].name),
        });

  return (
    <View style={styles.section}>
      <ProfileSectionHeader
        title={t('profile.preview.tasteTitle')}
        subtitle={t('profile.preview.tasteSubtitle')}
      />
      <View style={styles.card}>
        {topGenres.map((genre) => {
          const percent = getGenrePercentage(genre.count, total);
          return (
            <ProfileBarRow
              key={genre.genreId}
              label={translateGenreName(genre.name)}
              valueLabel={`${percent}%`}
              progress={percent / 100}
              accessibilityLabel={t('profile.preview.tasteGenreAccessibility', {
                genre: translateGenreName(genre.name),
                percent,
              })}
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
