import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { CatalogImage } from '../../shared/components/CatalogImage';
import type { EpisodeSummaryResponse } from '../../episode/types';
import { useAuth } from '@/auth/useAuth';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useSeasonWatchedEpisodes } from '@/features/watch-history/hooks/useSeasonWatchedEpisodes';
import {
  useMarkThroughEpisode,
  useToggleEpisodeWatched,
} from '@/features/watch-history/hooks/useWatchHistoryMutations';
import {
  formatIsoDate,
  formatRating,
  formatRuntimeMinutes,
} from '@/utils/format';
import { layout } from '@/theme/layout';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface EpisodeListItemProps {
  tvShowId: string;
  seasonNumber: number;
  episode: EpisodeSummaryResponse;
  isWatched: boolean;
  showWatchedControl: boolean;
  onMarkThrough: (episode: EpisodeSummaryResponse) => void;
}

function EpisodeListItem({
  tvShowId,
  seasonNumber,
  episode,
  isWatched,
  showWatchedControl,
  onMarkThrough,
}: EpisodeListItemProps) {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const toggleWatched = useToggleEpisodeWatched(episode.id, tvShowId, seasonNumber);
  const title = episode.name ?? `Episode ${episode.episodeNumber}`;
  const airDate = formatIsoDate(episode.airDate);
  const runtime = formatRuntimeMinutes(episode.runtimeMinutes);

  const metadata = [
    airDate,
    runtime,
    episode.voteAverage > 0 ? `★ ${formatRating(episode.voteAverage)}` : null,
    isWatched ? 'Watched' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const handleOpenEpisode = () => {
    router.push(`/tv/${tvShowId}/season/${seasonNumber}/episode/${episode.episodeNumber}`);
  };

  const handleToggleWatched = () => {
    if (!requireAuth()) {
      return;
    }

    toggleWatched.mutate(isWatched);
  };

  const handleLongPress = () => {
    if (!requireAuth() || !showWatchedControl) {
      return;
    }

    Alert.alert(title, undefined, [
      {
        text: 'Mark through here as watched',
        onPress: () => onMarkThrough(episode),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View
      style={[styles.row, isWatched && styles.rowWatched]}
      testID={`episode-row-${episode.episodeNumber}`}
    >
      {showWatchedControl ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isWatched ? 'Mark episode as unwatched' : 'Mark episode as watched'}
          accessibilityState={{ selected: isWatched, busy: toggleWatched.isPending }}
          disabled={toggleWatched.isPending}
          onPress={handleToggleWatched}
          hitSlop={6}
          style={({ pressed }) => [
            styles.watchedControl,
            pressed && !toggleWatched.isPending && styles.pressed,
          ]}
          testID={`episode-watched-toggle-${episode.episodeNumber}`}
        >
          {toggleWatched.isPending ? (
            <ActivityIndicator color={colors.accent} size="small" />
          ) : (
            <Ionicons
              name={isWatched ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={isWatched ? colors.progressCompleted : colors.textMuted}
            />
          )}
        </Pressable>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${title}`}
        onPress={handleOpenEpisode}
        onLongPress={handleLongPress}
        delayLongPress={400}
        style={({ pressed }) => [styles.content, pressed && styles.pressed]}
        testID={`episode-content-${episode.episodeNumber}`}
      >
        <CatalogImage
          path={episode.stillPath}
          width={layout.posterList.width}
          height={Math.round(layout.posterList.width * (9 / 16))}
          accessibilityLabel={`${title} still`}
          rounded
        />

        <View style={styles.meta}>
          <AppText variant="bodySmall" numberOfLines={2}>
            E{episode.episodeNumber} · {title}
          </AppText>
          {metadata ? (
            <AppText variant="caption" muted numberOfLines={1}>
              {metadata}
            </AppText>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}

interface EpisodeListProps {
  tvShowId: string;
  seasonNumber: number;
  episodes: EpisodeSummaryResponse[];
}

export function EpisodeList({ tvShowId, seasonNumber, episodes }: EpisodeListProps) {
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useRequireAuth();
  const watchedQuery = useSeasonWatchedEpisodes(tvShowId, seasonNumber);
  const markThroughMutation = useMarkThroughEpisode(tvShowId, seasonNumber);
  const [feedback, setFeedback] = useState<string | null>(null);

  const watchedIds = useMemo(
    () => new Set(watchedQuery.data?.watchedEpisodeIds ?? []),
    [watchedQuery.data?.watchedEpisodeIds],
  );

  const handleMarkThrough = (episode: EpisodeSummaryResponse) => {
    if (!requireAuth()) {
      return;
    }

    markThroughMutation.mutate(episode.id, {
      onError: () => {
        setFeedback('Could not mark episodes as watched. Please try again.');
      },
    });
  };

  const watchedControlWidth = 44;
  const separatorInset =
    spacing.md +
    (isAuthenticated ? watchedControlWidth + spacing.md : 0) +
    layout.posterList.width +
    spacing.md;

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

      <View style={styles.list}>
        {episodes.map((episode, index) => (
          <View key={episode.id}>
            <EpisodeListItem
              tvShowId={tvShowId}
              seasonNumber={seasonNumber}
              episode={episode}
              isWatched={watchedIds.has(episode.id)}
              showWatchedControl={isAuthenticated}
              onMarkThrough={handleMarkThrough}
            />
            {index < episodes.length - 1 ? (
              <View style={[styles.separator, { marginLeft: separatorInset }]} />
            ) : null}
          </View>
        ))}
      </View>

      <FeedbackMessage message={feedback} tone="error" onDismiss={() => setFeedback(null)} />
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
    marginBottom: 0,
  },
  list: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 68,
    gap: spacing.xs,
  },
  rowWatched: {
    backgroundColor: colors.progressCompletedTint12,
  },
  watchedControl: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
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
