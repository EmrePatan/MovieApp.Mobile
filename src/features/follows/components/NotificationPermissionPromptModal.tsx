import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { premiumSheet, premiumSheetChrome } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';

interface NotificationPermissionPromptModalProps {
  visible: boolean;
  requiresSettings: boolean;
  busy?: boolean;
  onDismiss: () => void;
  onEnable: () => void;
}

export function NotificationPermissionPromptModal({
  visible,
  requiresSettings,
  busy = false,
  onDismiss,
  onEnable,
}: NotificationPermissionPromptModalProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <View style={premiumSheetChrome.overlay}>
        <Pressable style={premiumSheetChrome.backdrop} onPress={onDismiss} accessibilityRole="button" />
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={premiumSheetChrome.handle} />
          <AppText variant="title" style={premiumSheetChrome.title}>
            {t('details.notificationsPermission.title')}
          </AppText>
          <AppText variant="body" style={premiumSheetChrome.subtitle}>
            {t('details.notificationsPermission.body')}
          </AppText>
          <View style={styles.actions}>
            <AppButton
              title={t('details.notificationsPermission.notNow')}
              variant="secondary"
              onPress={onDismiss}
              disabled={busy}
            />
            <AppButton
              title={
                requiresSettings
                  ? t('details.notificationsPermission.openSettings')
                  : t('details.notificationsPermission.enable')
              }
              onPress={onEnable}
              loading={busy}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    ...premiumSheetChrome.sheet,
    gap: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
});
