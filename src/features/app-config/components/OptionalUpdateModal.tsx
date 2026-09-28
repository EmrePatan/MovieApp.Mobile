import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
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

  const title = t('appConfig.optionalUpdate.title');

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
      accessibilityViewIsModal
    >
      <View style={styles.host} pointerEvents="box-none">
        <View
          pointerEvents="box-none"
          style={[styles.anchor, { paddingTop: insets.top + spacing.xs }]}
        >
          <View
            style={styles.card}
            accessibilityRole="alert"
            accessibilityLabel={title}
          >
            <View
              style={styles.iconWrap}
              accessible={false}
              importantForAccessibility="no-hide-descendants"
            >
              <Ionicons name="arrow-down-circle-outline" size={18} color={colors.accent} />
            </View>

            <AppText
              variant="bodySmall"
              style={styles.title}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </AppText>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('appConfig.optionalUpdate.updateButtonAccessibility')}
              onPress={handleUpdate}
              hitSlop={6}
              style={({ pressed }) => [styles.updateButton, pressed && styles.updateButtonPressed]}
            >
              <AppText variant="caption" style={styles.updateLabel} numberOfLines={1}>
                {t('appConfig.optionalUpdate.updateButton')}
              </AppText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('appConfig.optionalUpdate.closeButtonAccessibility')}
              onPress={handleClose}
              hitSlop={10}
              style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
            >
              <Ionicons name="close" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  anchor: {
    paddingHorizontal: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentTint18,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    flexShrink: 0,
  },
  title: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  updateButton: {
    flexShrink: 0,
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonPressed: {
    opacity: interaction.pressedOpacity,
  },
  updateLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  closeButton: {
    flexShrink: 0,
    width: interaction.touchTarget,
    height: interaction.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.xs,
  },
  closeButtonPressed: {
    opacity: interaction.pressedOpacity,
  },
});
