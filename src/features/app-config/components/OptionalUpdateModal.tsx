import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { Platform } from 'react-native';
import {
  loadOptionalUpdateDismissal,
  saveOptionalUpdateDismissal,
  shouldShowOptionalUpdateAfterDismissal,
} from '../optional-update-dismissal-storage';
import { useAppConfig } from '../hooks/useAppConfig';

export function OptionalUpdateModal() {
  const { t } = useTranslation();
  const { evaluation, config, markOptionalUpdateShownThisSession, optionalUpdateSessionSuppressed } =
    useAppConfig();
  const [visible, setVisible] = useState(false);
  const dismissedThisSessionRef = useRef(false);

  const tryPresent = useCallback(async () => {
    if (evaluation.updatePrompt !== 'optional' || !evaluation.storeUrl) {
      setVisible(false);
      return;
    }

    if (dismissedThisSessionRef.current || optionalUpdateSessionSuppressed) {
      setVisible(false);
      return;
    }

    const platformConfig =
      Platform.OS === 'ios' ? config.versions.ios : config.versions.android;
    const dismissal = await loadOptionalUpdateDismissal();

    if (!shouldShowOptionalUpdateAfterDismissal(platformConfig.latestBuild, dismissal)) {
      setVisible(false);
      return;
    }

    setVisible(true);
    markOptionalUpdateShownThisSession();
  }, [
    config.versions.android,
    config.versions.ios,
    evaluation.storeUrl,
    evaluation.updatePrompt,
    markOptionalUpdateShownThisSession,
    optionalUpdateSessionSuppressed,
  ]);

  useEffect(() => {
    void tryPresent();
  }, [tryPresent]);

  const handleLater = async () => {
    const platformConfig =
      Platform.OS === 'ios' ? config.versions.ios : config.versions.android;
    await saveOptionalUpdateDismissal(platformConfig.latestBuild);
    dismissedThisSessionRef.current = true;
    setVisible(false);
  };

  const handleUpdate = () => {
    if (evaluation.storeUrl) {
      void Linking.openURL(evaluation.storeUrl);
    }
    setVisible(false);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleLater}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('appConfig.optionalUpdate.laterButton')}
          style={styles.backdrop}
          onPress={handleLater}
        />
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <AppText variant="subtitle" center accessibilityRole="header">
            {t('appConfig.optionalUpdate.title')}
          </AppText>
          <View style={styles.actions}>
            <AppButton
              title={t('appConfig.optionalUpdate.laterButton')}
              variant="secondary"
              onPress={handleLater}
              style={styles.action}
            />
            <AppButton
              title={t('appConfig.optionalUpdate.updateButton')}
              onPress={handleUpdate}
              accessibilityLabel={t('appConfig.optionalUpdate.updateButtonAccessibility')}
              style={styles.action}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
  action: {
    alignSelf: 'stretch',
  },
});
