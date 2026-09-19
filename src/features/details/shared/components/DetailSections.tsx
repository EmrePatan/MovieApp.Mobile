import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import { translateGenreName } from '@/i18n/catalog-labels';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface DetailMetaItemProps {
  label: string;
  value: string;
}

export function DetailMetaItem({ label, value }: DetailMetaItemProps) {
  return (
    <View style={styles.item} accessibilityRole="text">
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <AppText variant="bodySmall">{value}</AppText>
    </View>
  );
}

interface DetailGenresProps {
  genres: string[];
}

export function DetailGenres({ genres }: DetailGenresProps) {
  const { t } = useTranslation();

  if (genres.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <HomeSectionHeader title={t('details.sections.genres')} />
      <View style={[styles.body, styles.genreRow]}>
        {genres.map((genre) => (
          <View key={genre} style={styles.genreChip}>
            <AppText variant="caption">{translateGenreName(genre)}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

interface DetailOverviewProps {
  overview: string | null;
}

export function DetailOverview({ overview }: DetailOverviewProps) {
  const { t } = useTranslation();

  if (!overview) {
    return null;
  }

  return (
    <View style={styles.section}>
      <HomeSectionHeader title={t('details.sections.overview')} />
      <AppText variant="body" muted style={styles.body}>
        {overview}
      </AppText>
    </View>
  );
}

interface DetailExternalIdsProps {
  tmdbId: number | null;
  tvdbId: number | null;
  imdbId: string | null;
}

export function DetailExternalIds({ tmdbId, tvdbId, imdbId }: DetailExternalIdsProps) {
  const items = [
    tmdbId != null ? `TMDB ${tmdbId}` : null,
    tvdbId != null ? `TVDB ${tvdbId}` : null,
    imdbId ? `IMDb ${imdbId}` : null,
  ].filter(Boolean);

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <AppText variant="caption" muted>
        {items.join(' • ')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  body: {
    paddingHorizontal: spacing.lg,
  },
  item: {
    gap: 2,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  genreChip: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
