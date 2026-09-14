import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { isApiError } from '@/api/errors';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import {
  useCreateTvShowFollow,
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
  isFollowing: boolean;
  status?: TvShowFollowStatusResponse;
  onClose: () => void;
  onFollowSuccess?: () => void | Promise<void>;
}

export function FollowPreferencesModal({
  visible,
  tvShowId,
  isFollowing,
  status,
  onClose,
  onFollowSuccess,
}: FollowPreferencesModalProps) {
  const createFollow = useCreateTvShowFollow(tvShowId);
  const updateFollow = useUpdateTvShowFollow(tvShowId);
  const removeFollow = useRemoveTvShowFollow(tvShowId);
  const [notifyNewSeasons, setNotifyNewSeasons] = useState(true);
  const [notifyNewEpisodes, setNotifyNewEpisodes] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const wasVisibleRef = useRef(false);

  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      if (isFollowing && status) {
        setNotifyNewSeasons(status.notifyNewSeasons);
        setNotifyNewEpisodes(status.notifyNewEpisodes);
      } else {
        setNotifyNewSeasons(true);
        setNotifyNewEpisodes(true);
      }

      setErrorMessage(null);
    }

    wasVisibleRef.current = visible;
  }, [visible, isFollowing, status?.notifyNewEpisodes, status?.notifyNewSeasons]);

  const bothPreferencesOff = !notifyNewSeasons && !notifyNewEpisodes;
  const isBusy = createFollow.isPending || updateFollow.isPending || removeFollow.isPending;

  const handleConfirm = () => {
    setErrorMessage(null);

    if (bothPreferencesOff) {
      if (isFollowing) {
        removeFollow.mutate(undefined, {
          onSuccess: () => {
            onClose();
          },
          onError: () => {
            setErrorMessage('Could not unfollow this show. Please try again.');
          },
        });
        return;
      }

      onClose();
      return;
    }

    const request = {
      notifyNewSeasons,
      notifyNewEpisodes,
    };

    if (isFollowing) {
      updateFollow.mutate(request, {
        onSuccess: () => {
          onClose();
        },
        onError: () => {
          setErrorMessage('Could not update follow preferences. Please try again.');
        },
      });
      return;
    }

    createFollow.mutate(request, {
      onSuccess: async () => {
        onClose();
        await onFollowSuccess?.();
      },
      onError: (error) => {
        if (isApiError(error) && error.status === 503) {
          setErrorMessage('Could not finish follow setup right now. Please try again.');
          return;
        }

        setErrorMessage('Could not follow this show. Please try again.');
      },
    });
  };

  const title = isFollowing ? 'Follow preferences' : 'Follow this show';
  const subtitle = isFollowing
    ? 'Choose which release updates you want to hear about.'
    : 'Choose what you want notifications for before following.';
  const confirmLabel = isFollowing ? 'Save preferences' : 'Follow show';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheetContainer}>
          <View style={styles.sheet}>
            <View style={styles.hero}>
              <View style={styles.iconBadge}>
                <Ionicons name="notifications" size={22} color={colors.accent} />
              </View>
              <View style={styles.headerText}>
                <AppText variant="title">{title}</AppText>
                <AppText variant="bodySmall" muted>
                  {subtitle}
                </AppText>
              </View>
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
              description="When a new season is announced or released"
              icon="albums-outline"
              selected={notifyNewSeasons}
              disabled={isBusy}
              onPress={() => setNotifyNewSeasons((value) => !value)}
            />
            <PreferenceRow
              label="New episodes"
              description="When new episodes become available"
              icon="play-circle-outline"
              selected={notifyNewEpisodes}
              disabled={isBusy}
              onPress={() => setNotifyNewEpisodes((value) => !value)}
            />

            {bothPreferencesOff ? (
              <AppText variant="caption" muted style={styles.bothOffHint}>
                {isFollowing
                  ? 'Saving with all notifications turned off will unfollow this show.'
                  : 'Following with all notifications turned off will not follow this show.'}
              </AppText>
            ) : null}

            <AppButton
              title={confirmLabel}
              onPress={handleConfirm}
              loading={isBusy}
              disabled={isBusy}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

interface PreferenceRowProps {
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}

function PreferenceRow({
  label,
  description,
  icon,
  selected,
  disabled = false,
  onPress,
}: PreferenceRowProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.preferenceRow,
        selected && styles.preferenceRowSelected,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.preferenceLeading}>
        <View style={[styles.preferenceIcon, selected && styles.preferenceIconSelected]}>
          <Ionicons
            name={icon}
            size={18}
            color={selected ? colors.accent : colors.textMuted}
          />
        </View>
        <View style={styles.preferenceCopy}>
          <AppText variant="body">{label}</AppText>
          <AppText variant="caption" muted>
            {description}
          </AppText>
        </View>
      </View>
      <Ionicons
        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
        size={24}
        color={selected ? colors.accent : colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
  },
  sheetContainer: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionLabel: {
    color: colors.textSecondary,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  preferenceRowSelected: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentTint12,
  },
  preferenceLeading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  preferenceIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  preferenceIconSelected: {
    backgroundColor: colors.accentTint18,
  },
  preferenceCopy: {
    flex: 1,
    gap: 2,
  },
  bothOffHint: {
    lineHeight: 18,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  disabled: {
    opacity: interaction.busyOpacity,
  },
});
