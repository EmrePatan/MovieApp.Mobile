import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { DetailCircularAction } from '@/features/details/shared/components/DetailCircularAction';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { colors } from '@/theme/colors';
import { useCreateMovieFollow, useRemoveMovieFollow } from '../hooks/useMovieFollowMutations';
import { useMovieFollowStatus } from '../hooks/useMovieFollowStatus';
import { ensurePushDeviceRegisteredAsync } from '../services/push-device-service';

interface MovieFollowButtonProps {
  movieId: string;
}

export function MovieFollowButton({ movieId }: MovieFollowButtonProps) {
  const { t } = useTranslation();
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const { data: status, isLoading } = useMovieFollowStatus(movieId);
  const createFollow = useCreateMovieFollow(movieId);
  const removeFollow = useRemoveMovieFollow(movieId);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [permissionHint, setPermissionHint] = useState<string | null>(null);

  const isFollowing = status?.isFollowing ?? false;
  const isInitialLoading = isAuthenticated && isLoading;
  const isMutationPending = createFollow.isPending || removeFollow.isPending;

  const handleFollowSuccess = async () => {
    const registrationResult = await ensurePushDeviceRegisteredAsync();
    if (registrationResult === 'permission_denied') {
      setPermissionHint(t('details.actions.enableNotificationsSettings'));
    }
  };

  const handlePress = () => {
    if (!requireAuth()) {
      setFeedback(t('details.actions.signInReleaseAlerts'));
      return;
    }

    setFeedback(null);
    setPermissionHint(null);

    if (isMutationPending) {
      return;
    }

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

  const accessibilityLabel = isFollowing
    ? t('details.actions.releaseAlertOn')
    : t('details.actions.notifyWhenReleased');
  const label = isFollowing ? t('details.actions.alertOn') : t('details.actions.notifyLabel');

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
        busy={isInitialLoading}
        disabled={isMutationPending}
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
