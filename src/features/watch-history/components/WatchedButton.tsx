import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isApiError } from '@/api/errors';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { DetailCircularAction } from '@/features/details/shared/components/DetailCircularAction';
import { DetailFramedIconControl } from '@/features/details/shared/components/DetailFramedIconControl';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useDetailActionStatusBatch } from '@/features/library-actions/context/DetailActionStatusContext';
import { useEpisodeWatchStatus } from '../hooks/useEpisodeWatchStatus';
import { useMovieWatchStatus } from '../hooks/useMovieWatchStatus';
import { useTvShowProgress } from '../hooks/useTvShowProgress';
import {
  useToggleEpisodeWatched,
  useToggleMovieWatched,
  useToggleTvShowWatched,
} from '../hooks/useWatchHistoryMutations';
import { isTvShowFullyWatched } from '../utils/tv-show-watch-status';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

type WatchedTarget =
  | {
      type: 'movie';
      contentId: string;
    }
  | {
      type: 'tvshow';
      contentId: string;
    }
  | {
      type: 'episode';
      contentId: string;
      tvShowId: string;
      seasonNumber: number;
    };

interface WatchedButtonProps {
  target: WatchedTarget;
  size?: number;
  variant?: 'default' | 'detail';
  onMarkedWatched?: () => void;
  onBeforeUnwatch?: () => Promise<boolean>;
}

export function WatchedButton({
  target,
  size = 48,
  variant = 'default',
  onMarkedWatched,
  onBeforeUnwatch,
}: WatchedButtonProps) {
  const { t } = useTranslation();
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const { batchFailed } = useDetailActionStatusBatch();
  const movieWatchStatusEnabled = target.type === 'movie' && batchFailed;
  const movieStatus = useMovieWatchStatus(target.type === 'movie' ? target.contentId : '', {
    enabled: movieWatchStatusEnabled,
  });
  const tvProgress = useTvShowProgress(target.type === 'tvshow' ? target.contentId : '');
  const episodeStatus = useEpisodeWatchStatus(target.type === 'episode' ? target.contentId : '');
  const toggleMovie = useToggleMovieWatched(target.type === 'movie' ? target.contentId : '');
  const toggleTvShow = useToggleTvShowWatched(target.type === 'tvshow' ? target.contentId : '');
  const toggleEpisode = useToggleEpisodeWatched(
    target.type === 'episode' ? target.tvShowId : '',
    target.type === 'episode' ? target.seasonNumber : 0,
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const statusQuery =
    target.type === 'movie'
      ? movieStatus
      : target.type === 'episode'
        ? episodeStatus
        : tvProgress;
  const toggleMutation =
    target.type === 'movie'
      ? toggleMovie
      : target.type === 'tvshow'
        ? toggleTvShow
        : toggleEpisode;
  const isWatched =
    target.type === 'tvshow'
      ? isTvShowFullyWatched(tvProgress.data)
      : (statusQuery.data as { isWatched?: boolean } | undefined)?.isWatched ?? false;
  const isMutationPending = toggleMutation.isPending;
  const isDetailVariant = variant === 'detail';
  const isInitialLoading = !isDetailVariant && isAuthenticated && statusQuery.isLoading;
  const isInteractionDisabled = isDetailVariant
    ? isMutationPending
    : isInitialLoading || isMutationPending;
  const active = isAuthenticated && isWatched;

  const handlePress = async () => {
    if (!requireAuth()) {
      setFeedback(t('details.actions.signInWatchHistory'));
      return;
    }

    if (isMutationPending) {
      return;
    }

    if (active && onBeforeUnwatch) {
      const proceed = await onBeforeUnwatch();
      if (!proceed) {
        return;
      }
    }

    const onError = (error: unknown) => {
      setFeedback(
        isApiError(error)
          ? t('details.actions.watchedUpdateError')
          : t('details.actions.watchedUpdateError'),
      );
    };

    const onSuccess = () => {
      if (!active) {
        onMarkedWatched?.();
      }
    };

    if (target.type === 'episode') {
      toggleEpisode.mutate({ episodeId: target.contentId, isWatched }, { onError, onSuccess });
      return;
    }

    if (target.type === 'tvshow') {
      toggleTvShow.mutate(isWatched, { onError, onSuccess });
      return;
    }

    toggleMovie.mutate(isWatched, { onError, onSuccess });
  };

  const label = active ? t('common.markAsUnwatched') : t('common.markAsWatched');

  if (variant === 'detail') {
    return (
      <>
        <FeedbackMessage message={feedback} tone="error" onDismiss={() => setFeedback(null)} />
        <DetailCircularAction
          label={t('details.actions.watchedLabel')}
          accessibilityLabel={label}
          active={active}
          busy={isMutationPending}
          disabled={isMutationPending}
          onPress={handlePress}
        >
          <Ionicons
            name={active ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={22}
            color={active ? colors.accent : colors.textPrimary}
          />
        </DetailCircularAction>
      </>
    );
  }

  return (
    <>
      <FeedbackMessage message={feedback} tone="error" onDismiss={() => setFeedback(null)} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{
          selected: active,
          disabled: isInteractionDisabled,
          busy: isInitialLoading,
        }}
        disabled={isInteractionDisabled}
        onPress={handlePress}
        style={({ pressed }) => [
          pressed && !isInteractionDisabled && styles.pressed,
          isInteractionDisabled && styles.disabled,
        ]}
      >
        <DetailFramedIconControl
          size={size}
          borderRadius={borderRadius.md}
          variant={active ? 'gold' : 'neutral'}
          glow={active}
          surfaceColor={active ? colors.accentTint12 : colors.surfaceElevated}
        >
          {isInitialLoading ? (
            <ActivityIndicator color={colors.accent} size="small" />
          ) : (
            <Ionicons
              name={active ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={22}
              color={active ? colors.accent : colors.textPrimary}
            />
          )}
        </DetailFramedIconControl>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  disabled: {
    opacity: interaction.busyOpacity,
  },
});

