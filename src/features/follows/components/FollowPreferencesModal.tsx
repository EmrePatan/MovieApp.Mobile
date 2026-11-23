import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SheetHandle, SwipeSheet } from '@/components/layout/SwipeableSheet';
import { useQueryClient } from '@tanstack/react-query';
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
import {
  verifyTvShowFollowPreferences,
  verifyTvShowUnfollowed,
} from '../utils/verify-follow-mutation-outcome';
import { premiumSheet, premiumSheetChrome } from '@/theme/premium-sheet';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { GlassSheetLayer } from '@/components/common/GlassSheetLayer';

interface FollowPreferencesModalProps {
  visible: boolean;
  tvShowId: string;
  isFollowing: boolean;
  status?: TvShowFollowStatusResponse;
  onClose: () => void;
  onFollowSuccess?: (
    notifyNewSeasons: boolean,
    notifyNewEpisodes: boolean,
  ) => void | Promise<void>;
}

export function FollowPreferencesModal({
  visible,
  tvShowId,
  isFollowing,
  status,
  onClose,
  onFollowSuccess,
}: FollowPreferencesModalProps) {
  const [sheetInstance, setSheetInstance] = useState(0);
  const openedSessionRef = useRef<{ tvShowId: string } | null>(null);

  useEffect(() => {
    if (!visible) {
      openedSessionRef.current = null;
      return;
    }

    if (openedSessionRef.current?.tvShowId === tvShowId) {
      return;
    }

    openedSessionRef.current = { tvShowId };
    setSheetInstance((value) => value + 1);
  }, [visible, tvShowId]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {visible ? (
        <FollowPreferencesSheet
          key={`${tvShowId}:${sheetInstance}`}
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

function resolveInitialNotifyPreference(
  isFollowing: boolean,
  value?: boolean,
): boolean {
  if (!isFollowing) {
    return true;
  }

  return value ?? true;
}

function FollowPreferencesSheet({
  tvShowId,
  isFollowing,
  status,
  onClose,
  onFollowSuccess,
}: Omit<FollowPreferencesModalProps, 'visible'>) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const createFollow = useCreateTvShowFollow(tvShowId);
  const updateFollow = useUpdateTvShowFollow(tvShowId);
  const removeFollow = useRemoveTvShowFollow(tvShowId);
  const [wasFollowingWhenOpened, setWasFollowingWhenOpened] = useState(isFollowing);
  const [notifyNewSeasons, setNotifyNewSeasons] = useState(() =>
    resolveInitialNotifyPreference(isFollowing, status?.notifyNewSeasons),
  );
  const [notifyNewEpisodes, setNotifyNewEpisodes] = useState(() =>
    resolveInitialNotifyPreference(isFollowing, status?.notifyNewEpisodes),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const bothPreferencesOff = !notifyNewSeasons && !notifyNewEpisodes;
  const isBusy = createFollow.isPending || updateFollow.isPending || removeFollow.isPending;

  const handleConfirm = async () => {
    if (isBusy) {
      return;
    }

    setErrorMessage(null);

    if (bothPreferencesOff) {
      if (wasFollowingWhenOpened) {
        try {
          await removeFollow.mutateAsync();
        } catch {
          if (!(await verifyTvShowUnfollowed(queryClient, tvShowId))) {
            setErrorMessage(t('details.followPreferences.unfollowError'));
            return;
          }
        }

        setWasFollowingWhenOpened(false);
        onClose();
        return;
      }

      onClose();
      return;
    }

    const request = {
      notifyNewSeasons,
      notifyNewEpisodes,
    };

    if (wasFollowingWhenOpened) {
      try {
        await updateFollow.mutateAsync(request);
      } catch {
        if (!(await verifyTvShowFollowPreferences(queryClient, tvShowId, request))) {
          setErrorMessage(t('details.followPreferences.updateError'));
          return;
        }
      }

      onClose();
      return;
    }

    try {
      await createFollow.mutateAsync(request);
      onClose();
      await onFollowSuccess?.(notifyNewSeasons, notifyNewEpisodes);
    } catch (error) {
      if (isApiError(error) && error.status === 503) {
        setErrorMessage(t('details.followPreferences.setupError'));
        return;
      }

      if (await verifyTvShowFollowPreferences(queryClient, tvShowId, request)) {
        onClose();
        await onFollowSuccess?.(notifyNewSeasons, notifyNewEpisodes);
        return;
      }

      setErrorMessage(t('details.followPreferences.followError'));
    }
  };

  const isEditingExistingFollow = wasFollowingWhenOpened;
  const title = isEditingExistingFollow
    ? t('details.followPreferences.titleFollowing')
    : t('details.followPreferences.titleNew');
  const subtitle = isEditingExistingFollow
    ? t('details.followPreferences.subtitleFollowing')
    : t('details.followPreferences.subtitleNew');
  const confirmLabel = isEditingExistingFollow
    ? t('details.followPreferences.savePreferences')
    : t('details.followPreferences.followShow');

  return (
      <View style={premiumSheetChrome.overlay}>
        <SafeAreaView style={styles.sheetContainer}>
          <SwipeSheet onClose={onClose} style={styles.sheet}>
            <GlassSheetLayer />
            <SheetHandle />
            <View style={styles.hero}>
              <View style={styles.iconBadge}>
                <Ionicons name="notifications" size={22} color={premiumSheet.mutedGold} />
              </View>
              <View style={styles.headerText}>
                <AppText variant="title" style={premiumSheetChrome.title}>{title}</AppText>
                <AppText variant="bodySmall" style={premiumSheetChrome.subtitle}>
                  {subtitle}
                </AppText>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={onClose}>
                <Ionicons name="close" size={22} color={premiumSheet.textPrimary} />
              </Pressable>
            </View>

            <FeedbackMessage
              message={errorMessage}
              tone="error"
              onDismiss={() => setErrorMessage(null)}
            />

            <View style={styles.notificationsBlock}>
              <AppText variant="body" style={styles.sectionLabel}>
                {t('details.followPreferences.notificationsSection')}
              </AppText>

              <View style={styles.preferenceList}>
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
              </View>
            </View>

            {bothPreferencesOff ? (
              <AppText variant="caption" muted style={styles.bothOffHint}>
                {isEditingExistingFollow
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
          </SwipeSheet>
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
            color={selected ? premiumSheet.mutedGold : premiumSheet.textSecondary}
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
        color={selected ? premiumSheet.mutedGold : premiumSheet.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    justifyContent: 'flex-end',
  },
  sheet: {
    ...premiumSheetChrome.sheet,
    gap: spacing.md,
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
  notificationsBlock: {
    gap: spacing.sm,
  },
  sectionLabel: {
    color: premiumSheet.textSecondary,
  },
  preferenceList: {
    gap: spacing.xs,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: premiumSheet.rowBorder,
    backgroundColor: premiumSheet.secondary,
    gap: spacing.md,
  },
  preferenceRowSelected: {
    borderColor: premiumSheet.goldBorder,
    backgroundColor: premiumSheet.elevated,
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
    backgroundColor: 'rgba(210, 164, 81, 0.18)',
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
