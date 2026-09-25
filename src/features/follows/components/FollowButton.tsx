import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { DetailCircularAction } from '@/features/details/shared/components/DetailCircularAction';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { colors } from '@/theme/colors';
import { useDetailActionStatusBatch } from '@/features/library-actions/context/DetailActionStatusContext';
import { useTvShowFollowStatus } from '../hooks/useTvShowFollowStatus';
import { ensurePushDeviceRegisteredAsync } from '../services/push-device-service';
import {
  getNotificationPermissionState,
  openNotificationSettingsAsync,
  requestNotificationPermissionAsync,
} from '../services/notification-permission-service';
import {
  isNotificationPermissionPromptDismissed,
  markNotificationPermissionPromptDismissed,
} from '../services/notification-permission-prompt-storage';
import { FollowPreferencesModal } from './FollowPreferencesModal';
import { NotificationPermissionPromptModal } from './NotificationPermissionPromptModal';

interface FollowButtonProps {
  tvShowId: string;
}

export function FollowButton({ tvShowId }: FollowButtonProps) {
  const { t } = useTranslation();
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const { deferIndividualStatusQueries, batchHydrated, batchFailed } =
    useDetailActionStatusBatch();
  const followStatusEnabled =
    !deferIndividualStatusQueries && (batchHydrated || batchFailed);
  const { data: status } = useTvShowFollowStatus(tvShowId, {
    enabled: followStatusEnabled,
  });
  const [preferencesVisible, setPreferencesVisible] = useState(false);
  const [signInFeedback, setSignInFeedback] = useState<string | null>(null);
  const [permissionPromptVisible, setPermissionPromptVisible] = useState(false);
  const [permissionRequiresSettings, setPermissionRequiresSettings] = useState(false);
  const [permissionActionBusy, setPermissionActionBusy] = useState(false);

  const isFollowing = status?.isFollowing ?? false;
  const handlePress = () => {
    if (!requireAuth()) {
      setSignInFeedback(t('details.actions.signInFollowTv'));
      return;
    }

    setSignInFeedback(null);
    setPreferencesVisible(true);
  };

  const handleFollowSuccess = async (notifyNewSeasons: boolean, notifyNewEpisodes: boolean) => {
    const notificationsRequested = notifyNewSeasons || notifyNewEpisodes;
    if (!notificationsRequested) {
      return;
    }

    const permissionState = await getNotificationPermissionState();
    if (permissionState === 'granted') {
      await ensurePushDeviceRegisteredAsync({ allowPermissionRequest: false });
      return;
    }

    if (await isNotificationPermissionPromptDismissed()) {
      return;
    }

    setPermissionRequiresSettings(permissionState === 'settings_required');
    setPermissionPromptVisible(true);
  };

  const handleDismissPermissionPrompt = async () => {
    await markNotificationPermissionPromptDismissed();
    setPermissionPromptVisible(false);
  };

  const handleEnableNotifications = async () => {
    setPermissionActionBusy(true);

    try {
      if (permissionRequiresSettings) {
        await openNotificationSettingsAsync();
        setPermissionPromptVisible(false);
        return;
      }

      const granted = await requestNotificationPermissionAsync();
      if (granted) {
        await ensurePushDeviceRegisteredAsync({ allowPermissionRequest: false });
        setPermissionPromptVisible(false);
        return;
      }

      const nextState = await getNotificationPermissionState();
      setPermissionRequiresSettings(nextState === 'settings_required');
    } finally {
      setPermissionActionBusy(false);
    }
  };

  const label = isFollowing ? t('details.actions.manageFollow') : t('details.actions.followShow');

  return (
    <>
      <FeedbackMessage
        message={signInFeedback}
        tone="info"
        onDismiss={() => setSignInFeedback(null)}
      />
      <DetailCircularAction
        label={t('details.actions.followLabel')}
        accessibilityLabel={label}
        active={isAuthenticated && isFollowing}
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

      <NotificationPermissionPromptModal
        visible={permissionPromptVisible}
        requiresSettings={permissionRequiresSettings}
        busy={permissionActionBusy}
        onDismiss={handleDismissPermissionPrompt}
        onEnable={handleEnableNotifications}
      />
    </>
  );
}
