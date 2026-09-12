import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '../../shared/components/CatalogImage';
import type { EpisodeSummaryResponse } from '../../episode/types';
import {
  formatIsoDate,
  formatRating,
  formatRuntimeMinutes,
  formatVoteCount,
} from '@/utils/format';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface EpisodeListItemProps {
  tvShowId: string;
  seasonNumber: number;
  episode: EpisodeSummaryResponse;
}

export function EpisodeListItem({ tvShowId, seasonNumber, episode }: EpisodeListItemProps) {
  const router = useRouter();
  const title = episode.name ?? `Episode ${episode.episodeNumber}`;
  const airDate = formatIsoDate(episode.airDate);
  const runtime = formatRuntimeMinutes(episode.runtimeMinutes);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${title}`}
      onPress={() =>
        router.push(`/tv/${tvShowId}/season/${seasonNumber}/episode/${episode.episodeNumber}`)
      }
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <CatalogImage
        path={episode.stillPath}
        width={120}
        height={68}
        accessibilityLabel={`${title} still`}
        rounded
      />
      <View style={styles.meta}>
        <AppText variant="bodySmall">
          E{episode.episodeNumber}. {title}
        </AppText>
        <AppText variant="caption" muted>
          {airDate ?? 'Unknown air date'}
          {runtime ? ` • ${runtime}` : ''}
          {` • ★ ${formatRating(episode.voteAverage)}`}
          {` • ${formatVoteCount(episode.voteCount)} votes`}
        </AppText>
      </View>
    </Pressable>
  );
}

interface EpisodeListProps {
  tvShowId: string;
  seasonNumber: number;
  episodes: EpisodeSummaryResponse[];
}

export function EpisodeList({ tvShowId, seasonNumber, episodes }: EpisodeListProps) {
  if (episodes.length === 0) {
    return (
      <View style={styles.emptySection}>
        <AppText variant="bodySmall" muted center>
          No episodes available.
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <AppText variant="subtitle" style={styles.sectionTitle}>
        Episodes
      </AppText>
      {episodes.map((episode) => (
        <EpisodeListItem
          key={episode.id}
          tvShowId={tvShowId}
          seasonNumber={seasonNumber}
          episode={episode}
        />
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
