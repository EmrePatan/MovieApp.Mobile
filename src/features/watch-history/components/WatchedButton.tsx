import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isApiError } from '@/api/errors';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useEpisodeWatchStatus } from '../hooks/useEpisodeWatchStatus';
import { useMovieWatchStatus } from '../hooks/useMovieWatchStatus';
import {
  useToggleEpisodeWatched,
  useToggleMovieWatched,
} from '../hooks/useWatchHistoryMutations';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/spacing';

type WatchedTarget =
  | {
      type: 'movie';
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
}

export function WatchedButton({ target }: WatchedButtonProps) {
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const movieStatus = useMovieWatchStatus(target.type === 'movie' ? target.contentId : '');
  const episodeStatus = useEpisodeWatchStatus(target.type === 'episode' ? target.contentId : '');
  const toggleMovie = useToggleMovieWatched(target.type === 'movie' ? target.contentId : '');
  const toggleEpisode = useToggleEpisodeWatched(
    target.type === 'episode' ? target.contentId : '',
    target.type === 'episode' ? target.tvShowId : '',
    target.type === 'episode' ? target.seasonNumber : 0,
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const statusQuery = target.type === 'movie' ? movieStatus : episodeStatus;
  const toggleMutation = target.type === 'movie' ? toggleMovie : toggleEpisode;
  const isWatched = statusQuery.data?.isWatched ?? false;
  const isBusy =
    toggleMutation.isPending || (isAuthenticated && statusQuery.isLoading);
  const active = isAuthenticated && isWatched;

  const handlePress = () => {
    if (!requireAuth()) {
      setFeedback('Please sign in to track watch history.');
      return;
    }

    toggleMutation.mutate(isWatched, {
      onError: (error) => {
        setFeedback(
          isApiError(error)
            ? 'Could not update watched status. Please try again.'
            : 'Could not update watched status. Please try again.',
        );
      },
    });
  };

  const label = active ? 'Mark as unwatched' : 'Mark as watched';

  return (
    <>
      <FeedbackMessage message={feedback} tone="error" onDismiss={() => setFeedback(null)} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: active, disabled: isBusy, busy: isBusy }}
        disabled={isBusy}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.button,
          active && styles.buttonActive,
          pressed && !isBusy && styles.pressed,
          isBusy && styles.disabled,
        ]}
      >
        {isBusy ? (
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
    width: 48,
    height: 48,
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
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
});
