import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { DetailCircularAction } from '@/features/details/shared/components/DetailCircularAction';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { colors } from '@/theme/colors';
import { useTvShowFollowStatus } from '../hooks/useTvShowFollowStatus';
import { ensurePushDeviceRegisteredAsync } from '../services/push-device-service';
import { FollowPreferencesModal } from './FollowPreferencesModal';

interface FollowButtonProps {
  tvShowId: string;
}

export function FollowButton({ tvShowId }: FollowButtonProps) {
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const { data: status, isLoading } = useTvShowFollowStatus(tvShowId);
  const [preferencesVisible, setPreferencesVisible] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [permissionHint, setPermissionHint] = useState<string | null>(null);

  const isFollowing = status?.isFollowing ?? false;
  const isBusy = isAuthenticated && isLoading;

  const handlePress = () => {
    if (!requireAuth()) {
      setFeedback('Please sign in to follow TV shows.');
      return;
    }

    setFeedback(null);
    setPermissionHint(null);
    setPreferencesVisible(true);
  };

  const handleFollowSuccess = async () => {
    const registrationResult = await ensurePushDeviceRegisteredAsync();
    if (registrationResult === 'permission_denied') {
      setPermissionHint(
        'Followed. Enable notifications in device settings to receive release alerts.',
      );
    }
  };

  const label = isFollowing ? 'Manage follow' : 'Follow this show';

  return (
    <>
      <FeedbackMessage message={feedback} tone="error" onDismiss={() => setFeedback(null)} />
      <FeedbackMessage
        message={permissionHint}
        tone="info"
        onDismiss={() => setPermissionHint(null)}
      />
      <DetailCircularAction
        label="Follow"
        accessibilityLabel={label}
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

      <FollowPreferencesModal
        visible={preferencesVisible}
        tvShowId={tvShowId}
        isFollowing={isFollowing}
        status={status}
        onClose={() => setPreferencesVisible(false)}
        onFollowSuccess={handleFollowSuccess}
      />
    </>
  );
}
