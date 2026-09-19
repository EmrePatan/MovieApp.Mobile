import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface ShowCompletedBannerProps {
  showTitle: string;
}

export function ShowCompletedBanner({ showTitle }: ShowCompletedBannerProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container} testID="show-completed-banner">
      <View style={styles.iconBadge}>
        <Ionicons name="trophy" size={22} color={colors.progressCompleted} />
      </View>
      <View style={styles.copy}>
        <AppText variant="bodySmall" style={styles.title}>
          {t('details.showCompleted.title')}
        </AppText>
        <AppText variant="caption" muted numberOfLines={2}>
          {t('details.showCompleted.message', { showTitle })}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(76, 175, 130, 0.35)',
    backgroundColor: colors.progressCompletedTint12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.progressCompleted,
    fontWeight: '700',
  },
});
