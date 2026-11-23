import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SheetHandle, SwipeSheet } from '@/components/layout/SwipeableSheet';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { premiumSheet, premiumSheetChrome } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';
import { GlassSheetLayer } from '@/components/common/GlassSheetLayer';

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
        <SwipeSheet onClose={onDismiss} style={styles.sheet} bottomInset>
          <GlassSheetLayer />
          <SheetHandle />
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
        </SwipeSheet>
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
