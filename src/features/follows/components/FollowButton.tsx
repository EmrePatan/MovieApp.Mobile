import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const { data: status, isLoading } = useTvShowFollowStatus(tvShowId);
  const [preferencesVisible, setPreferencesVisible] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [permissionHint, setPermissionHint] = useState<string | null>(null);

  const isFollowing = status?.isFollowing ?? false;
  const isBusy = isAuthenticated && isLoading;

  const handlePress = () => {
    if (!requireAuth()) {
      setFeedback(t('details.actions.signInFollowTv'));
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
        t('details.actions.followedEnableNotifications'),
      );
    }
  };

  const label = isFollowing ? t('details.actions.manageFollow') : t('details.actions.followShow');

  return (
    <>
      <FeedbackMessage message={feedback} tone="error" onDismiss={() => setFeedback(null)} />
      <FeedbackMessage
        message={permissionHint}
        tone="info"
        onDismiss={() => setPermissionHint(null)}
      />
      <DetailCircularAction
        label={t('details.actions.followLabel')}
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
