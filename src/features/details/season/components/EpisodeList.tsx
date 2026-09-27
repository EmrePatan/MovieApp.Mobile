import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import { CatalogImage } from '../../shared/components/CatalogImage';
import { WaxSealMedallion } from '../../shared/components/WaxSealMedallion';
import { waxSealCardStyles } from '../../shared/components/waxSealCardStyles';
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
import { spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

const EPISODE_STILL_WIDTH = layout.posterList.width;
const EPISODE_STILL_HEIGHT = Math.round(EPISODE_STILL_WIDTH * (9 / 16));

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
    <View style={styles.episodeRow} testID={`episode-row-${episode.episodeNumber}`}>
      <View style={[waxSealCardStyles.card, isWatched && waxSealCardStyles.cardCompleted]}>
        <View style={waxSealCardStyles.inner}>
          <WaxSealMedallion
            completed={isWatched}
            pending={isTogglePending}
            onPress={showWatchedControl ? handleToggleWatched : undefined}
            accessibilityLabel={
              isWatched ? t('common.markAsUnwatched') : t('common.markAsWatched')
            }
            testID={
              showWatchedControl ? `episode-watched-toggle-${episode.episodeNumber}` : undefined
            }
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.openTitle', { title })}
            onPress={handleOpenEpisode}
            onLongPress={handleLongPress}
            delayLongPress={400}
            style={({ pressed }) => [waxSealCardStyles.content, pressed && styles.pressed]}
            testID={`episode-content-${episode.episodeNumber}`}
          >
            <CatalogImage
              path={episode.stillPath}
              width={EPISODE_STILL_WIDTH}
              height={EPISODE_STILL_HEIGHT}
              accessibilityLabel={t('common.episodeStillAccessibility', { title })}
              rounded
            />
            <View style={waxSealCardStyles.body}>
              <AppText variant="bodySmall" numberOfLines={2}>
                {t('common.episodeLine', { episode: episode.episodeNumber, title })}
              </AppText>
              {metadata ? (
                <AppText variant="caption" muted numberOfLines={1}>
                  {metadata}
                </AppText>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>
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
    ({ item }: { item: EpisodeSummaryResponse }) => (
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
    ),
    [
      handleMarkThrough,
      handleToggleWatched,
      isAuthenticated,
      pendingEpisodeId,
      seasonNumber,
      tvShowId,
      watchedIds,
    ],
  );

  const headerComponent = useMemo(
    () => (
      <View>
        {listHeader}
        <HomeSectionHeader title={t('common.episodes')} compactSpacing />
      </View>
    ),
    [listHeader, t],
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
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  episodeRow: {
    width: '100%',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  emptySection: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
});
