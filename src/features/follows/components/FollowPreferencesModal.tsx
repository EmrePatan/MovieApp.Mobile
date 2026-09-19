import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const sheetKey = `${tvShowId}:${isFollowing}:${status?.notifyNewSeasons ?? 'n'}:${status?.notifyNewEpisodes ?? 'n'}`;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {visible ? (
        <FollowPreferencesSheet
          key={sheetKey}
          tvShowId={tvShowId}
          isFollowing={isFollowing}
          status={status}
          onClose={onClose}
          onFollowSuccess={onFollowSuccess}
        />
      ) : null}
    </Modal>
  );
}

function FollowPreferencesSheet({
  tvShowId,
  isFollowing,
  status,
  onClose,
  onFollowSuccess,
}: Omit<FollowPreferencesModalProps, 'visible'>) {
  const { t } = useTranslation();
  const createFollow = useCreateTvShowFollow(tvShowId);
  const updateFollow = useUpdateTvShowFollow(tvShowId);
  const removeFollow = useRemoveTvShowFollow(tvShowId);
  const [notifyNewSeasons, setNotifyNewSeasons] = useState(
    isFollowing && status ? status.notifyNewSeasons : true,
  );
  const [notifyNewEpisodes, setNotifyNewEpisodes] = useState(
    isFollowing && status ? status.notifyNewEpisodes : true,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            setErrorMessage(t('details.followPreferences.unfollowError'));
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
          setErrorMessage(t('details.followPreferences.updateError'));
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
          setErrorMessage(t('details.followPreferences.setupError'));
          return;
        }

        setErrorMessage(t('details.followPreferences.followError'));
      },
    });
  };

  const title = isFollowing
    ? t('details.followPreferences.titleFollowing')
    : t('details.followPreferences.titleNew');
  const subtitle = isFollowing
    ? t('details.followPreferences.subtitleFollowing')
    : t('details.followPreferences.subtitleNew');
  const confirmLabel = isFollowing
    ? t('details.followPreferences.savePreferences')
    : t('details.followPreferences.followShow');

  return (
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
              <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={onClose}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </Pressable>
            </View>

            <FeedbackMessage
              message={errorMessage}
              tone="error"
              onDismiss={() => setErrorMessage(null)}
            />

            <AppText variant="body" style={styles.sectionLabel}>
              {t('details.followPreferences.notificationsSection')}
            </AppText>

            <PreferenceRow
              label={t('details.followPreferences.newSeasons')}
              description={t('details.followPreferences.newSeasonsDescription')}
              icon="albums-outline"
              selected={notifyNewSeasons}
              disabled={isBusy}
              onPress={() => setNotifyNewSeasons((value) => !value)}
            />
            <PreferenceRow
              label={t('details.followPreferences.newEpisodes')}
              description={t('details.followPreferences.newEpisodesDescription')}
              icon="play-circle-outline"
              selected={notifyNewEpisodes}
              disabled={isBusy}
              onPress={() => setNotifyNewEpisodes((value) => !value)}
            />

            {bothPreferencesOff ? (
              <AppText variant="caption" muted style={styles.bothOffHint}>
                {isFollowing
                  ? t('details.followPreferences.bothOffFollowing')
                  : t('details.followPreferences.bothOffNew')}
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
