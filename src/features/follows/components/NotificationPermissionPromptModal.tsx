import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

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
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onDismiss} accessibilityRole="button" />
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <AppText variant="title" style={styles.title}>
            {t('details.notificationsPermission.title')}
          </AppText>
          <AppText variant="body" style={styles.body}>
            {t('details.notificationsPermission.body')}
          </AppText>
          <View style={styles.actions}>
            <AppButton
              label={t('details.notificationsPermission.notNow')}
              variant="secondary"
              onPress={onDismiss}
              disabled={busy}
            />
            <AppButton
              label={
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
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  title: {
    color: colors.textPrimary,
  },
  body: {
    color: colors.textSecondary,
  },
  actions: {
    gap: spacing.sm,
  },
});
