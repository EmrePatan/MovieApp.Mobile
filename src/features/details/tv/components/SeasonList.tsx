import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import { CatalogImage } from '../../shared/components/CatalogImage';
import { WaxSealMedallion } from '../../shared/components/WaxSealMedallion';
import { waxSealCardStyles } from '../../shared/components/waxSealCardStyles';
import { SeasonProgressBar } from '@/features/watch-history/components/SeasonProgressBar';
import { useAuth } from '@/auth/useAuth';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useTvShowProgress } from '@/features/watch-history/hooks/useTvShowProgress';
import { buildSeasonProgressMap } from '@/features/watch-history/utils/tv-show-progress-cache';
import type { TvShowSeasonProgressResponse } from '@/features/watch-history/types';
import { ShowCompletedBanner } from '@/features/watch-history/components/ShowCompletedBanner';
import { useToggleSeasonWatched } from '@/features/watch-history/hooks/useWatchHistoryMutations';
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
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { i18n } from '@/i18n';

const SEASON_POSTER_WIDTH = 56;
const SEASON_POSTER_HEIGHT = 84;

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
        <AppText variant="bodySmall" numberOfLines={2} style={styles.title}>
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
  seasonProgress?: TvShowSeasonProgressResponse;
  progressReady: boolean;
}

export function SeasonListItem({
  tvShowId,
  season,
  showWatchedControl,
  seasonProgress,
  progressReady,
}: SeasonListItemProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const toggleSeasonWatched = useToggleSeasonWatched(tvShowId, season.seasonNumber);
  const [feedback, setFeedback] = useState<string | null>(null);
  const label = season.name ?? t('common.seasonNumber', { number: season.seasonNumber });
  const airYear = season.airDate ? season.airDate.slice(0, 4) : null;
  const totalEpisodes = Math.max(
    seasonProgress?.totalEpisodes ?? 0,
    season.episodeCount ?? 0,
  );
  const watchedEpisodes = seasonProgress?.watchedEpisodes ?? 0;
  const showProgress = showWatchedControl && progressReady && totalEpisodes > 0;
  const isFullyWatched = getSeasonProgressState(watchedEpisodes, totalEpisodes) === 'completed';
  const canToggleSeason = totalEpisodes > 0;

  const metadata = [
    t('common.seasonNumber', { number: season.seasonNumber }),
    airYear,
    season.episodeCount != null
      ? i18n.t(season.episodeCount === 1 ? 'common.episodeCount' : 'common.episodesCount', {
          count: season.episodeCount,
        })
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
          setFeedback(t('details.actions.seasonProgressError'));
        },
      },
    );
  };

  return (
    <View style={styles.seasonRow} testID={`season-row-${season.seasonNumber}`}>
      <View
        style={[
          waxSealCardStyles.card,
          isFullyWatched && showProgress && waxSealCardStyles.cardCompleted,
        ]}
      >
        <View style={waxSealCardStyles.inner}>
          <WaxSealMedallion
            completed={isFullyWatched && showProgress}
            pending={toggleSeasonWatched.isPending}
            disabled={!canToggleSeason}
            onPress={
              showWatchedControl
                ? handleToggleSeasonWatched
                : undefined
            }
            accessibilityLabel={
              isFullyWatched ? t('common.markSeasonUnwatched') : t('common.markSeasonWatched')
            }
            testID={
              showWatchedControl ? `season-watched-toggle-${season.seasonNumber}` : undefined
            }
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.openTitle', { title: label })}
            onPress={handleOpenSeason}
            style={({ pressed }) => [waxSealCardStyles.content, pressed && styles.pressed]}
            testID={`season-content-${season.seasonNumber}`}
          >
            <CatalogImage
              path={season.posterPath}
              width={SEASON_POSTER_WIDTH}
              height={SEASON_POSTER_HEIGHT}
              accessibilityLabel={t('common.posterAccessibility', { title: label })}
            />
            <View style={waxSealCardStyles.body}>
              {showProgress ? (
                <SeasonListItemProgress
                  label={label}
                  watchedEpisodes={watchedEpisodes}
                  totalEpisodes={totalEpisodes}
                  airYear={airYear}
                  showProgress
                />
              ) : (
                <>
                  <AppText variant="bodySmall" numberOfLines={2}>
                    {label}
                  </AppText>
                  {metadata ? (
                    <AppText variant="caption" muted numberOfLines={2}>
                      {metadata}
                    </AppText>
                  ) : null}
                </>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      <FeedbackMessage message={feedback} tone="error" onDismiss={() => setFeedback(null)} />
    </View>
  );
}

interface SeasonListProps {
  tvShowId: string;
  seasons: SeasonSummaryResponse[];
  showTitle?: string;
}

export function SeasonList({
  tvShowId,
  seasons,
  showTitle = '',
}: SeasonListProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [seasonsExpanded, setSeasonsExpanded] = useState(false);
  const tvProgressQuery = useTvShowProgress(tvShowId);
  const progressBySeason = useMemo(
    () => buildSeasonProgressMap(tvProgressQuery.data?.seasons),
    [tvProgressQuery.data?.seasons],
  );
  const progressReady =
    !isAuthenticated ||
    (!tvProgressQuery.isLoading && !tvProgressQuery.isError && tvProgressQuery.data != null);

  const tvProgress = tvProgressQuery.data;
  const isShowCompleted = tvProgress?.isCompleted === true;
  const tvSummary =
    isAuthenticated && tvProgress
      ? formatTvShowWatchedSummary(tvProgress.watchedEpisodes, tvProgress.totalEpisodes)
      : null;

  const canCollapseSeasons = shouldCollapseSeasonList(seasons.length);
  const visibleSeasons = getVisibleSeasons(seasons, seasonsExpanded);
  const hiddenSeasonCount = Math.max(0, seasons.length - COLLAPSED_SEASON_PREVIEW_COUNT);

  const sectionTitle =
    seasons.length > 1
      ? t('details.sections.seasonsWithCount', { count: seasons.length })
      : t('details.sections.seasons');

  if (seasons.length === 0) {
    return (
      <View style={styles.emptySection}>
        <AppText variant="bodySmall" muted center>
          {t('details.sections.seasonsEmpty')}
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <HomeSectionHeader title={sectionTitle} compactSpacing />
      {tvSummary ? (
        <AppText
          variant="caption"
          muted
          style={styles.progressSummary}
          testID="tv-show-watched-summary"
        >
          {tvSummary}
        </AppText>
      ) : null}

      {isShowCompleted && showTitle ? (
        <View style={styles.insetHorizontal}>
          <ShowCompletedBanner showTitle={showTitle} />
        </View>
      ) : null}

      <View style={styles.sealList}>
        {visibleSeasons.map((season) => (
          <SeasonListItem
            key={season.id}
            tvShowId={tvShowId}
            season={season}
            showWatchedControl={isAuthenticated}
            seasonProgress={progressBySeason.get(season.seasonNumber)}
            progressReady={progressReady}
          />
        ))}
      </View>

      {canCollapseSeasons ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            seasonsExpanded
              ? t('common.showFewer')
              : t('common.showAllSeasons', { count: seasons.length })
          }
          onPress={() => setSeasonsExpanded((current) => !current)}
          style={({ pressed }) => [styles.expandRow, pressed && styles.pressed]}
          testID="season-list-expand-toggle"
        >
          <AppText variant="bodySmall" style={styles.expandLabel}>
            {seasonsExpanded
              ? t('common.showFewer')
              : t('common.showAllSeasons', { count: seasons.length })}
          </AppText>
          {!seasonsExpanded && hiddenSeasonCount > 0 ? (
            <AppText variant="caption" muted>
              {t('common.moreCount', { count: hiddenSeasonCount })}
            </AppText>
          ) : null}
          <Ionicons
            name={seasonsExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.accent}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  progressSummary: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginTop: -spacing.xs,
  },
  insetHorizontal: {
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  sealList: {
    marginHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.sm,
  },
  seasonRow: {
    width: '100%',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  meta: {
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.xs,
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
    color: colors.accent,
    fontWeight: '600',
  },
  emptySection: {
    marginTop: spacing.lg,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
});
