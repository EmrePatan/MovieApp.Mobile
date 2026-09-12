import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '../../shared/components/CatalogImage';
import type { SeasonSummaryResponse } from '../types';
import { formatIsoDate } from '@/utils/format';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface SeasonListItemProps {
  tvShowId: string;
  season: SeasonSummaryResponse;
}

export function SeasonListItem({ tvShowId, season }: SeasonListItemProps) {
  const router = useRouter();
  const label = season.name ?? `Season ${season.seasonNumber}`;
  const airDate = formatIsoDate(season.airDate);
  const episodeLabel =
    season.episodeCount != null ? `${season.episodeCount} episodes` : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${label}`}
      onPress={() => router.push(`/tv/${tvShowId}/season/${season.seasonNumber}`)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <CatalogImage
        path={season.posterPath}
        width={72}
        height={108}
        accessibilityLabel={`${label} poster`}
      />
      <View style={styles.meta}>
        <AppText variant="body">{label}</AppText>
        <AppText variant="caption" muted>
          Season {season.seasonNumber}
          {airDate ? ` • ${airDate}` : ''}
          {episodeLabel ? ` • ${episodeLabel}` : ''}
        </AppText>
      </View>
    </Pressable>
  );
}

interface SeasonListProps {
  tvShowId: string;
  seasons: SeasonSummaryResponse[];
}

export function SeasonList({ tvShowId, seasons }: SeasonListProps) {
  if (seasons.length === 0) {
    return (
      <View style={styles.emptySection}>
        <AppText variant="bodySmall" muted center>
          No seasons available.
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <AppText variant="subtitle" style={styles.sectionTitle}>
        Seasons
      </AppText>
      {seasons.map((season) => (
        <SeasonListItem key={season.id} tvShowId={tvShowId} season={season} />
      ))}
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.85,
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
  },
  emptySection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
});
