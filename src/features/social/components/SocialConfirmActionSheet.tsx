import { Modal, StyleSheet, View } from 'react-native';
import { AppBottomSheetChrome } from '@/components/layout/AppBottomSheet';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/theme/spacing';

interface SocialConfirmActionSheetProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  confirmLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SocialConfirmActionSheet({
  visible,
  title,
  message,
  confirmLabel,
  destructive = false,
  confirmLoading = false,
  onClose,
  onConfirm,
}: SocialConfirmActionSheetProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {visible ? (
        <AppBottomSheetChrome onClose={onClose} title={title} testID="social-confirm-sheet">
          <AppText variant="bodySmall" muted style={styles.message}>
            {message}
          </AppText>
          <View style={styles.actions}>
            <AppButton
              title={confirmLabel}
              variant={destructive ? 'destructive' : 'primary'}
              loading={confirmLoading}
              onPress={onConfirm}
            />
            <AppButton title={t('social.cancel')} variant="ghost" onPress={onClose} />
          </View>
        </AppBottomSheetChrome>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  message: {
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    gap: spacing.sm,
  },
});