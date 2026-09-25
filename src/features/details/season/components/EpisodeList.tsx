import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
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

const EPISODE_ROW_HEIGHT = 68;

interface EpisodeListItemProps {
  tvShowId: string;
  seasonNumber: number;
  episode: EpisodeSummaryResponse;
  isWatched: boolean;
  isTogglePending: boolean;
  showWatchedControl: boolean;
  onToggleWatched: (episode: EpisodeSummaryResponse, isWatched: boolean) => void;
  onMarkThrough: (episode: EpisodeSummaryResponse) => void;
}

function EpisodeListItem({
  tvShowId,
  seasonNumber,
  episode,
  isWatched,
  isTogglePending,
  showWatchedControl,
  onToggleWatched,
  onMarkThrough,
}: EpisodeListItemProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const title = episode.name ?? `${t('common.episode')} ${episode.episodeNumber}`;
  const airDate = formatIsoDate(episode.airDate);
  const runtime = formatRuntimeMinutes(episode.runtimeMinutes);

  const metadata = [
    airDate,
    runtime,
    episode.voteAverage > 0 ? `★ ${formatRating(episode.voteAverage)}` : null,
    isWatched ? t('common.watched') : null,
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

    onToggleWatched(episode, isWatched);
  };

  const handleLongPress = () => {
    if (!requireAuth() || !showWatchedControl) {
      return;
    }

    Alert.alert(title, undefined, [
      {
        text: t('common.markThroughHereAsWatched'),
        onPress: () => onMarkThrough(episode),
      },
      { text: t('common.cancel'), style: 'cancel' },
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
          accessibilityLabel={isWatched ? t('common.markAsUnwatched') : t('common.markAsWatched')}
          accessibilityState={{ selected: isWatched, busy: isTogglePending }}
          disabled={isTogglePending}
          onPress={handleToggleWatched}
          hitSlop={6}
          style={({ pressed }) => [
            styles.watchedControl,
            pressed && !isTogglePending && styles.pressed,
          ]}
          testID={`episode-watched-toggle-${episode.episodeNumber}`}
        >
          {isTogglePending ? (
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
        accessibilityLabel={t('common.openTitle', { title })}
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
          accessibilityLabel={t('common.episodeStillAccessibility', { title })}
          rounded
        />

        <View style={styles.meta}>
          <AppText variant="bodySmall" numberOfLines={2}>
            {t('common.episodeLine', { episode: episode.episodeNumber, title })}
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
  listHeader?: ReactNode;
}

export function EpisodeList({
  tvShowId,
  seasonNumber,
  episodes,
  listHeader,
}: EpisodeListProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useRequireAuth();
  const watchedQuery = useSeasonWatchedEpisodes(tvShowId, seasonNumber);
  const toggleWatched = useToggleEpisodeWatched(tvShowId, seasonNumber);
  const markThroughMutation = useMarkThroughEpisode(tvShowId, seasonNumber);
  const [feedback, setFeedback] = useState<string | null>(null);
  const pendingEpisodeId = toggleWatched.isPending
    ? toggleWatched.variables?.episodeId ?? null
    : null;

  const watchedIds = useMemo(
    () => new Set(watchedQuery.data?.watchedEpisodeIds ?? []),
    [watchedQuery.data?.watchedEpisodeIds],
  );

  const handleMarkThrough = useCallback(
    (episode: EpisodeSummaryResponse) => {
      if (!requireAuth()) {
        return;
      }

      markThroughMutation.mutate(episode.id, {
        onError: () => {
          setFeedback(t('details.actions.markThroughEpisodesError'));
        },
      });
    },
    [markThroughMutation, requireAuth, t],
  );

  const watchedControlWidth = 44;
  const separatorInset =
    spacing.md +
    (isAuthenticated ? watchedControlWidth + spacing.md : 0) +
    layout.posterList.width +
    spacing.md;

  const handleToggleWatched = useCallback(
    (episode: EpisodeSummaryResponse, isWatched: boolean) => {
      if (!requireAuth()) {
        return;
      }

      toggleWatched.mutate({ episodeId: episode.id, isWatched });
    },
    [requireAuth, toggleWatched],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: EpisodeSummaryResponse; index: number }) => (
      <View>
        <EpisodeListItem
          tvShowId={tvShowId}
          seasonNumber={seasonNumber}
          episode={item}
          isWatched={watchedIds.has(item.id)}
          isTogglePending={pendingEpisodeId === item.id}
          showWatchedControl={isAuthenticated}
          onToggleWatched={handleToggleWatched}
          onMarkThrough={handleMarkThrough}
        />
        {index < episodes.length - 1 ? (
          <View style={[styles.separator, { marginLeft: separatorInset }]} />
        ) : null}
      </View>
    ),
    [
      episodes.length,
      handleMarkThrough,
      handleToggleWatched,
      isAuthenticated,
      pendingEpisodeId,
      seasonNumber,
      separatorInset,
      tvShowId,
      watchedIds,
    ],
  );

  const headerComponent = useMemo(
    () => (
      <View>
        {listHeader}
        <View style={styles.sectionHeader}>
          <AppText variant="subtitle" style={styles.sectionTitle}>
            {t('common.episodes')}
          </AppText>
        </View>
      </View>
    ),
    [listHeader],
  );

  if (episodes.length === 0) {
    return (
      <View style={styles.emptySection}>
        {listHeader}
        <AppText variant="bodySmall" muted center>
          No episodes available.
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={episodes}
        keyExtractor={(episode) => episode.id}
        renderItem={renderItem}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={
          <FeedbackMessage message={feedback} tone="error" onDismiss={() => setFeedback(null)} />
        }
        contentContainerStyle={styles.listContent}
        style={styles.list}
        initialNumToRender={12}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: EPISODE_ROW_HEIGHT,
    gap: spacing.xs,
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: spacing.lg,
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
    marginHorizontal: spacing.lg,
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
    gap: spacing.lg,
  },
});
