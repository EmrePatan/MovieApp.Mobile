import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function FollowingEmptyState() {
  const { t } = useTranslation();

  return (
    <View style={styles.container} accessibilityRole="text">
      <View style={styles.iconWrap}>
        <Ionicons name="notifications-outline" size={40} color={colors.textMuted} />
      </View>
      <AppText variant="subtitle" center>
        {t('following.emptyTitle')}
      </AppText>
      <AppText variant="bodySmall" muted center>
        {t('following.emptyMessage')}
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
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
});
