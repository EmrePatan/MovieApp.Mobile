import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import {
  loadOptionalUpdateDismissal,
  saveOptionalUpdateDismissal,
  shouldShowOptionalUpdateAfterDismissal,
} from '../optional-update-dismissal-storage';
import {
  canOpenOptionalUpdate,
  shouldDismissOptionalUpdate,
} from '../optional-update-presentation';
import { useAppConfig } from '../hooks/useAppConfig';

export function OptionalUpdateModal() {
  const { t } = useTranslation();
  const { evaluation, config, markOptionalUpdateShownThisSession, optionalUpdateSessionSuppressed } =
    useAppConfig();
  const [visible, setVisible] = useState(false);
  const isVisibleRef = useRef(false);
  const dismissedThisSessionRef = useRef(false);

  const setBannerVisible = useCallback((nextVisible: boolean) => {
    if (isVisibleRef.current === nextVisible) {
      return;
    }

    isVisibleRef.current = nextVisible;
    setVisible(nextVisible);
  }, []);

  const syncVisibility = useCallback(
    async (options?: { forceClose?: boolean }) => {
      if (options?.forceClose || shouldDismissOptionalUpdate(evaluation.updatePrompt, evaluation.storeUrl)) {
        setBannerVisible(false);
        return;
      }

      const platformConfig =
        Platform.OS === 'ios' ? config.versions.ios : config.versions.android;
      const dismissal = await loadOptionalUpdateDismissal();
      const persistedAllowsShow = shouldShowOptionalUpdateAfterDismissal(
        platformConfig.latestBuild,
        dismissal,
      );

      const canOpen = canOpenOptionalUpdate({
        updatePrompt: evaluation.updatePrompt,
        storeUrl: evaluation.storeUrl,
        isAlreadyVisible: isVisibleRef.current,
        dismissedThisSession: dismissedThisSessionRef.current,
        sessionSuppressed: optionalUpdateSessionSuppressed,
        persistedAllowsShow,
      });

      if (!canOpen) {
        return;
      }

      if (!isVisibleRef.current) {
        setBannerVisible(true);
        markOptionalUpdateShownThisSession();
      }
    },
    [
      config.versions.android,
      config.versions.ios,
      evaluation.storeUrl,
      evaluation.updatePrompt,
      markOptionalUpdateShownThisSession,
      optionalUpdateSessionSuppressed,
      setBannerVisible,
    ],
  );

  useEffect(() => {
    void syncVisibility();
  }, [syncVisibility]);

  const dismissForSession = useCallback(async () => {
    const platformConfig =
      Platform.OS === 'ios' ? config.versions.ios : config.versions.android;
    await saveOptionalUpdateDismissal(platformConfig.latestBuild);
    dismissedThisSessionRef.current = true;
    setBannerVisible(false);
  }, [config.versions.android, config.versions.ios, setBannerVisible]);

  const handleClose = () => {
    void dismissForSession();
  };

  const handleUpdate = () => {
    if (evaluation.storeUrl) {
      void Linking.openURL(evaluation.storeUrl);
    }
    dismissedThisSessionRef.current = true;
    setBannerVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
      accessibilityViewIsModal
    >
      <View style={styles.host} pointerEvents="box-none">
        <SafeAreaView edges={['top']} style={styles.safeArea} pointerEvents="box-none">
          <View
            style={styles.card}
            accessibilityRole="alert"
            accessibilityLabel={`${t('appConfig.optionalUpdate.title')}. ${t('appConfig.optionalUpdate.subtitle')}`}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('appConfig.optionalUpdate.closeButtonAccessibility')}
              onPress={handleClose}
              hitSlop={8}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </Pressable>

            <View style={styles.iconWrap} accessible={false} importantForAccessibility="no-hide-descendants">
              <Ionicons name="arrow-down-circle-outline" size={22} color={colors.accent} />
            </View>

            <View style={styles.copy}>
              <AppText variant="bodySmall" style={styles.title} numberOfLines={2}>
                {t('appConfig.optionalUpdate.title')}
              </AppText>
              <AppText variant="caption" muted numberOfLines={2}>
                {t('appConfig.optionalUpdate.subtitle')}
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('appConfig.optionalUpdate.updateButtonAccessibility')}
              onPress={handleUpdate}
              style={({ pressed }) => [styles.updateButton, pressed && styles.updateButtonPressed]}
            >
              <AppText variant="caption" style={styles.updateLabel}>
                {t('appConfig.optionalUpdate.updateButton')}
              </AppText>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  safeArea: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.accentSurface,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    minWidth: interaction.touchTarget,
    minHeight: interaction.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentTint18,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    marginTop: spacing.sm,
  },
  copy: {
    flex: 1,
    gap: 2,
    paddingRight: spacing.lg,
    paddingTop: spacing.xs,
  },
  title: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  updateButton: {
    minHeight: interaction.touchTarget,
    minWidth: 72,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  updateButtonPressed: {
    opacity: interaction.pressedOpacity,
  },
  updateLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
