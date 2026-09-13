import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { CatalogImage } from '../../shared/components/CatalogImage';
import { SeasonProgressBar } from '@/features/watch-history/components/SeasonProgressBar';
import { useAuth } from '@/auth/useAuth';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useSeasonProgress } from '@/features/watch-history/hooks/useSeasonProgress';
import { useTvShowProgress } from '@/features/watch-history/hooks/useTvShowProgress';
import { ShowCompletedBanner } from '@/features/watch-history/components/ShowCompletedBanner';
import { ShowCompletedConfettiOverlay } from '@/features/watch-history/components/ShowCompletedConfettiOverlay';
import { useShowCompletionCelebration } from '@/features/watch-history/hooks/useShowCompletionCelebration';
import { useToggleSeasonWatched } from '@/features/watch-history/hooks/useWatchHistoryMutations';
import { isShowFullyWatched } from '@/features/watch-history/utils/show-completion-celebration';
import {
  formatSeasonProgressCount,
  formatTvShowWatchedSummary,
  getSeasonProgressState,
  normalizeProgressCounts,
} from '@/features/watch-history/utils/season-progress';
import type { SeasonSummaryResponse } from '../types';
import {
  COLLAPSED_SEASON_PREVIEW_COUNT,
  getVisibleSeasons,
  shouldCollapseSeasonList,
} from '../utils/season-list-collapse';
import { layout } from '@/theme/layout';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

export interface SeasonListItemProgressProps {
  label: string;
  watchedEpisodes: number;
  totalEpisodes: number;
  airYear?: string | null;
  showProgress: boolean;
}

export function SeasonListItemProgress({
  label,
  watchedEpisodes,
  totalEpisodes,
  airYear,
  showProgress,
}: SeasonListItemProgressProps) {
  const { watchedEpisodes: watched, totalEpisodes: total } = normalizeProgressCounts(
    watchedEpisodes,
    totalEpisodes,
  );
  const countLabel = formatSeasonProgressCount(watched, total);

  return (
    <View style={styles.meta}>
      <View style={styles.titleRow}>
        <AppText variant="bodySmall" numberOfLines={1} style={styles.title}>
          {label}
        </AppText>
        {showProgress && total > 0 ? (
          <AppText variant="caption" style={styles.countLabel}>
            {countLabel}
          </AppText>
        ) : null}
      </View>
      {showProgress && total > 0 ? (
        <SeasonProgressBar
          watchedEpisodes={watched}
          totalEpisodes={total}
          testID="season-list-progress-bar"
        />
      ) : null}
      {airYear ? (
        <AppText variant="caption" muted numberOfLines={1}>
          {airYear}
        </AppText>
      ) : null}
    </View>
  );
}

interface SeasonListItemProps {
  tvShowId: string;
  season: SeasonSummaryResponse;
  showWatchedControl: boolean;
}

export function SeasonListItem({ tvShowId, season, showWatchedControl }: SeasonListItemProps) {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const progressQuery = useSeasonProgress(tvShowId, season.seasonNumber);
  const toggleSeasonWatched = useToggleSeasonWatched(tvShowId, season.seasonNumber);
  const [feedback, setFeedback] = useState<string | null>(null);
  const label = season.name ?? `Season ${season.seasonNumber}`;
  const airYear = season.airDate ? season.airDate.slice(0, 4) : null;
  const totalEpisodes = Math.max(
    progressQuery.data?.totalEpisodes ?? 0,
    season.episodeCount ?? 0,
  );
  const watchedEpisodes = progressQuery.data?.watchedEpisodes ?? 0;
  const showProgress = showWatchedControl && totalEpisodes > 0;
  const isFullyWatched = getSeasonProgressState(watchedEpisodes, totalEpisodes) === 'completed';
  const canToggleSeason = totalEpisodes > 0;

  const metadata = [
    `Season ${season.seasonNumber}`,
    airYear,
    season.episodeCount != null
      ? `${season.episodeCount} ${season.episodeCount === 1 ? 'ep' : 'eps'}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const handleOpenSeason = () => {
    router.push(`/tv/${tvShowId}/season/${season.seasonNumber}`);
  };

  const handleToggleSeasonWatched = () => {
    if (!requireAuth() || !canToggleSeason) {
      return;
    }

    toggleSeasonWatched.mutate(
      {
        isFullyWatched,
        totalEpisodes,
        episodeIds: [],
      },
      {
        onError: () => {
          setFeedback('Could not update season watch progress. Please try again.');
        },
      },
    );
  };

  return (
    <View
      style={[styles.row, isFullyWatched && showProgress && styles.rowWatched]}
      testID={`season-row-${season.seasonNumber}`}
    >
      {showWatchedControl ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isFullyWatched ? 'Mark season as unwatched' : 'Mark season as watched'
          }
          accessibilityState={{ selected: isFullyWatched, busy: toggleSeasonWatched.isPending }}
          disabled={toggleSeasonWatched.isPending || !canToggleSeason}
          onPress={handleToggleSeasonWatched}
          hitSlop={6}
          style={({ pressed }) => [
            styles.watchedControl,
            pressed && !toggleSeasonWatched.isPending && styles.pressed,
          ]}
          testID={`season-watched-toggle-${season.seasonNumber}`}
        >
          {toggleSeasonWatched.isPending ? (
            <ActivityIndicator color={colors.accent} size="small" />
          ) : (
            <Ionicons
              name={isFullyWatched ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={isFullyWatched ? colors.progressCompleted : colors.textMuted}
            />
          )}
        </Pressable>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${label}`}
        onPress={handleOpenSeason}
        style={({ pressed }) => [styles.content, pressed && styles.pressed]}
        testID={`season-content-${season.seasonNumber}`}
      >
        <CatalogImage
          path={season.posterPath}
          width={layout.posterList.width}
          height={layout.posterList.height}
          accessibilityLabel={`${label} poster`}
        />
        {showProgress ? (
          <SeasonListItemProgress
            label={label}
            watchedEpisodes={watchedEpisodes}
            totalEpisodes={totalEpisodes}
            airYear={airYear}
            showProgress
          />
        ) : (
          <View style={styles.meta}>
            <AppText variant="bodySmall" numberOfLines={2}>
              {label}
            </AppText>
            {metadata ? (
              <AppText variant="caption" muted numberOfLines={1}>
                {metadata}
              </AppText>
            ) : null}
          </View>
        )}
      </Pressable>

      <FeedbackMessage message={feedback} tone="error" onDismiss={() => setFeedback(null)} />
    </View>
  );
}

interface SeasonListProps {
  tvShowId: string;
  seasons: SeasonSummaryResponse[];
  showTitle?: string;
}

export function SeasonList({ tvShowId, seasons, showTitle = '' }: SeasonListProps) {
  const { isAuthenticated } = useAuth();
  const [seasonsExpanded, setSeasonsExpanded] = useState(false);
  const tvProgressQuery = useTvShowProgress(tvShowId);

  const tvProgress = tvProgressQuery.data;
  const watchedEpisodes = tvProgress?.watchedEpisodes ?? 0;
  const totalEpisodes = tvProgress?.totalEpisodes ?? 0;
  const isFullyWatched = isShowFullyWatched(watchedEpisodes, totalEpisodes);
  const { confettiVisible, dismissConfetti } = useShowCompletionCelebration({
    watchedEpisodes,
    totalEpisodes,
    enabled: isAuthenticated,
  });
  const tvSummary =
    isAuthenticated && tvProgress
      ? formatTvShowWatchedSummary(tvProgress.watchedEpisodes, tvProgress.totalEpisodes)
      : null;

  const canCollapseSeasons = shouldCollapseSeasonList(seasons.length);
  const visibleSeasons = getVisibleSeasons(seasons, seasonsExpanded);
  const hiddenSeasonCount = Math.max(0, seasons.length - COLLAPSED_SEASON_PREVIEW_COUNT);

  const watchedControlWidth = 44;
  const separatorInset =
    spacing.sm +
    (isAuthenticated ? watchedControlWidth + spacing.xs : 0) +
    layout.posterList.width +
    spacing.md;

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
      <View style={styles.headerBlock}>
        <AppText variant="subtitle" style={styles.sectionTitle}>
          {seasons.length > 1 ? `Seasons (${seasons.length})` : 'Seasons'}
        </AppText>
        {tvSummary ? (
          <AppText variant="caption" muted testID="tv-show-watched-summary">
            {tvSummary}
          </AppText>
        ) : null}
      </View>

      <ShowCompletedConfettiOverlay
        visible={confettiVisible}
        onDismiss={dismissConfetti}
      />

      {isFullyWatched && showTitle ? (
        <ShowCompletedBanner showTitle={showTitle} />
      ) : null}

      <View style={styles.list}>
        {visibleSeasons.map((season, index) => (
          <View key={season.id}>
            <SeasonListItem
              tvShowId={tvShowId}
              season={season}
              showWatchedControl={isAuthenticated}
            />
            {index < visibleSeasons.length - 1 || canCollapseSeasons ? (
              <View style={[styles.separator, { marginLeft: separatorInset }]} />
            ) : null}
          </View>
        ))}

        {canCollapseSeasons ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              seasonsExpanded
                ? 'Show fewer seasons'
                : `Show all ${seasons.length} seasons`
            }
            onPress={() => setSeasonsExpanded((current) => !current)}
            style={({ pressed }) => [styles.expandRow, pressed && styles.pressed]}
            testID="season-list-expand-toggle"
          >
            <AppText variant="bodySmall" style={styles.expandLabel}>
              {seasonsExpanded
                ? 'Show fewer seasons'
                : `Show all ${seasons.length} seasons`}
            </AppText>
            {!seasonsExpanded && hiddenSeasonCount > 0 ? (
              <AppText variant="caption" muted>
                +{hiddenSeasonCount} more
              </AppText>
            ) : null}
            <Ionicons
              name={seasonsExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  headerBlock: {
    gap: spacing.xs,
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
    minHeight: layout.posterList.height + spacing.sm * 2,
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
    backgroundColor: colors.surface,
    opacity: interaction.pressedOpacity,
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  countLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  expandLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptySection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
});
