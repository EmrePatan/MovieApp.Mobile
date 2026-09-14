import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { isApiError } from '@/api/errors';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import {
  useRemoveTvShowFollow,
  useUpdateTvShowFollow,
} from '../hooks/useTvShowFollowMutations';
import type { TvShowFollowStatusResponse } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface FollowPreferencesModalProps {
  visible: boolean;
  tvShowId: string;
  status: TvShowFollowStatusResponse;
  onClose: () => void;
}

export function FollowPreferencesModal({
  visible,
  tvShowId,
  status,
  onClose,
}: FollowPreferencesModalProps) {
  const updateFollow = useUpdateTvShowFollow(tvShowId);
  const removeFollow = useRemoveTvShowFollow(tvShowId);
  const [notifyNewSeasons, setNotifyNewSeasons] = useState(status.notifyNewSeasons);
  const [notifyNewEpisodes, setNotifyNewEpisodes] = useState(status.notifyNewEpisodes);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const wasVisibleRef = useRef(false);

  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      setNotifyNewSeasons(status.notifyNewSeasons);
      setNotifyNewEpisodes(status.notifyNewEpisodes);
      setErrorMessage(null);
    }

    wasVisibleRef.current = visible;
  }, [visible, status.notifyNewEpisodes, status.notifyNewSeasons]);

  const isBusy = updateFollow.isPending || removeFollow.isPending;

  const persistPreferences = (nextSeasons: boolean, nextEpisodes: boolean) => {
    setErrorMessage(null);
    updateFollow.mutate(
      {
        notifyNewSeasons: nextSeasons,
        notifyNewEpisodes: nextEpisodes,
      },
      {
        onError: () => {
          setErrorMessage('Could not update follow preferences. Please try again.');
        },
      },
    );
  };

  const handleToggleSeasons = () => {
    const nextValue = !notifyNewSeasons;
    setNotifyNewSeasons(nextValue);
    persistPreferences(nextValue, notifyNewEpisodes);
  };

  const handleToggleEpisodes = () => {
    const nextValue = !notifyNewEpisodes;
    setNotifyNewEpisodes(nextValue);
    persistPreferences(notifyNewSeasons, nextValue);
  };

  const handleUnfollow = () => {
    setErrorMessage(null);
    removeFollow.mutate(undefined, {
      onSuccess: () => {
        onClose();
      },
      onError: (error) => {
        setErrorMessage(
          isApiError(error)
            ? 'Could not unfollow this show. Please try again.'
            : 'Could not unfollow this show. Please try again.',
        );
      },
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheetContainer}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <AppText variant="title">Follow preferences</AppText>
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </Pressable>
            </View>

            <FeedbackMessage
              message={errorMessage}
              tone="error"
              onDismiss={() => setErrorMessage(null)}
            />

            <AppText variant="body" style={styles.sectionLabel}>
              Notifications
            </AppText>

            <PreferenceRow
              label="New seasons"
              selected={notifyNewSeasons}
              disabled={isBusy}
              onPress={handleToggleSeasons}
            />
            <PreferenceRow
              label="New episodes"
              selected={notifyNewEpisodes}
              disabled={isBusy}
              onPress={handleToggleEpisodes}
            />

            <AppButton
              title="Unfollow"
              variant="secondary"
              onPress={handleUnfollow}
              disabled={isBusy}
            />

            {isBusy ? <ActivityIndicator color={colors.accent} style={styles.spinner} /> : null}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

interface PreferenceRowProps {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}

function PreferenceRow({ label, selected, disabled = false, onPress }: PreferenceRowProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.preferenceRow,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <AppText variant="body">{label}</AppText>
      <Ionicons
        name={selected ? 'checkbox' : 'square-outline'}
        size={22}
        color={selected ? colors.accent : colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheetContainer: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    color: colors.textSecondary,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  disabled: {
    opacity: interaction.busyOpacity,
  },
  spinner: {
    alignSelf: 'center',
  },
});
