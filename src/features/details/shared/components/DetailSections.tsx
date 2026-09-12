import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
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
  if (genres.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <AppText variant="subtitle" style={styles.sectionTitle}>
        Genres
      </AppText>
      <View style={styles.genreRow}>
        {genres.map((genre) => (
          <View key={genre} style={styles.genreChip}>
            <AppText variant="caption">{genre}</AppText>
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
  if (!overview) {
    return null;
  }

  return (
    <View style={styles.section}>
      <AppText variant="subtitle" style={styles.sectionTitle}>
        Overview
      </AppText>
      <AppText variant="body" muted>
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
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
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
