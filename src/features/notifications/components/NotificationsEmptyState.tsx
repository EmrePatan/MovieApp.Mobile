import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { premiumSheet } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';


export function NotificationsEmptyState() {
  const { t } = useTranslation();

  return (
    <View style={styles.container} accessibilityRole="text">
      <View style={styles.iconWrap}>
        <Ionicons name="notifications-outline" size={40} color={premiumSheet.textSecondary} />
      </View>
      <AppText variant="subtitle" center style={styles.title}>
        {t('notifications.emptyTitle')}
      </AppText>
      <AppText variant="bodySmall" center style={styles.message}>
        {t('notifications.emptyMessage')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: premiumSheet.elevated,
    borderWidth: 1,
    borderColor: premiumSheet.rowBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    color: premiumSheet.textPrimary,
  },
  message: {
    color: premiumSheet.textSecondary,
  },
});

