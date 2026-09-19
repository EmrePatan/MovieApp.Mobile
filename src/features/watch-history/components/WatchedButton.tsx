import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isApiError } from '@/api/errors';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { DetailCircularAction } from '@/features/details/shared/components/DetailCircularAction';
import { useRequireAuth } from '@/hooks/useRequireAuth';
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
}

export function WatchedButton({ target, size = 48, variant = 'default' }: WatchedButtonProps) {
  const { t } = useTranslation();
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const movieStatus = useMovieWatchStatus(target.type === 'movie' ? target.contentId : '');
  const tvProgress = useTvShowProgress(target.type === 'tvshow' ? target.contentId : '');
  const episodeStatus = useEpisodeWatchStatus(target.type === 'episode' ? target.contentId : '');
  const toggleMovie = useToggleMovieWatched(target.type === 'movie' ? target.contentId : '');
  const toggleTvShow = useToggleTvShowWatched(target.type === 'tvshow' ? target.contentId : '');
  const toggleEpisode = useToggleEpisodeWatched(
    target.type === 'episode' ? target.contentId : '',
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
  const isInitialLoading = isAuthenticated && statusQuery.isLoading;
  const isMutationPending = toggleMutation.isPending;
  const isInteractionDisabled = isInitialLoading || isMutationPending;
  const active = isAuthenticated && isWatched;

  const handlePress = () => {
    if (!requireAuth()) {
      setFeedback(t('details.actions.signInWatchHistory'));
      return;
    }

    if (isMutationPending) {
      return;
    }

    toggleMutation.mutate(isWatched, {
      onError: (error) => {
        setFeedback(
          isApiError(error)
            ? t('details.actions.watchedUpdateError')
            : t('details.actions.watchedUpdateError'),
        );
      },
    });
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
          disabled={isInitialLoading || isMutationPending}
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
          styles.button,
          { width: size, height: size },
          active && styles.buttonActive,
          pressed && !isInteractionDisabled && styles.pressed,
          isInteractionDisabled && styles.disabled,
        ]}
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
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTint12,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  disabled: {
    opacity: interaction.busyOpacity,
  },
});
