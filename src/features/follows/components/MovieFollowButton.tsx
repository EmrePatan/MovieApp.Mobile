import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { DetailCircularAction } from '@/features/details/shared/components/DetailCircularAction';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { isFutureReleaseDate } from '@/utils/date';
import { colors } from '@/theme/colors';
import { useCreateMovieFollow, useRemoveMovieFollow } from '../hooks/useMovieFollowMutations';
import { useMovieFollowStatus } from '../hooks/useMovieFollowStatus';
import { ensurePushDeviceRegisteredAsync } from '../services/push-device-service';

interface MovieFollowButtonProps {
  movieId: string;
  releaseDate: string | null | undefined;
}

export function MovieFollowButton({ movieId, releaseDate }: MovieFollowButtonProps) {
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const isEligible = isFutureReleaseDate(releaseDate);
  const { data: status, isLoading } = useMovieFollowStatus(movieId, {
    enabled: isEligible,
  });
  const createFollow = useCreateMovieFollow(movieId);
  const removeFollow = useRemoveMovieFollow(movieId);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [permissionHint, setPermissionHint] = useState<string | null>(null);

  if (!isEligible) {
    return null;
  }

  const isFollowing = status?.isFollowing ?? false;
  const isBusy =
    isAuthenticated && (isLoading || createFollow.isPending || removeFollow.isPending);

  const handleFollowSuccess = async () => {
    const registrationResult = await ensurePushDeviceRegisteredAsync();
    if (registrationResult === 'permission_denied') {
      setPermissionHint(
        'Followed. Enable notifications in device settings to receive release alerts.',
      );
    }
  };

  const handlePress = () => {
    if (!requireAuth()) {
      setFeedback('Please sign in to get release alerts.');
      return;
    }

    setFeedback(null);
    setPermissionHint(null);

    if (isFollowing) {
      removeFollow.mutate();
      return;
    }

    createFollow.mutate(undefined, {
      onSuccess: () => {
        void handleFollowSuccess();
      },
    });
  };

  const accessibilityLabel = isFollowing ? 'Release alert on' : 'Notify me when released';
  const label = isFollowing ? 'Alert on' : 'Notify';

  return (
    <>
      <FeedbackMessage message={feedback} tone="error" onDismiss={() => setFeedback(null)} />
      <FeedbackMessage
        message={permissionHint}
        tone="info"
        onDismiss={() => setPermissionHint(null)}
      />
      <DetailCircularAction
        label={label}
        accessibilityLabel={accessibilityLabel}
        active={isAuthenticated && isFollowing}
        busy={isBusy}
        onPress={handlePress}
      >
        <Ionicons
          name={isFollowing ? 'notifications' : 'notifications-outline'}
          size={22}
          color={isFollowing ? colors.accent : colors.textPrimary}
        />
      </DetailCircularAction>
    </>
  );
}
