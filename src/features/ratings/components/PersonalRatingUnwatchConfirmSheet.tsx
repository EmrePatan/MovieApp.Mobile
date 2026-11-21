import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { premiumSheet, premiumSheetChrome } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';

interface PersonalRatingUnwatchConfirmSheetProps {
  visible: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function PersonalRatingUnwatchConfirmSheet({
  visible,
  loading = false,
  onCancel,
  onConfirm,
}: PersonalRatingUnwatchConfirmSheetProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      {visible ? (
        <View style={premiumSheetChrome.overlay} testID="personal-rating-unwatch-confirm">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
            style={premiumSheetChrome.backdrop}
            onPress={onCancel}
          />
          <SafeAreaView style={styles.sheet} edges={['bottom']}>
            <View style={premiumSheetChrome.handle} />
            <AppText variant="subtitle" style={styles.title}>
              {t('ratings.unwatchConfirm.title')}
            </AppText>
            <AppText variant="bodySmall" muted style={styles.message}>
              {t('ratings.unwatchConfirm.message')}
            </AppText>
            <View style={styles.actions}>
              <AppButton
                title={t('ratings.unwatchConfirm.confirm')}
                variant="destructive"
                loading={loading}
                disabled={loading}
                onPress={onConfirm}
                testID="personal-rating-unwatch-confirm-button"
              />
              <AppButton
                title={t('common.cancel')}
                variant="ghost"
                disabled={loading}
                onPress={onCancel}
              />
            </View>
          </SafeAreaView>
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    ...premiumSheetChrome.sheet,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
    color: premiumSheet.textPrimary,
    fontWeight: '700',
  },
  message: {
    textAlign: 'center',
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
