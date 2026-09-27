import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface MyCommentsEmptyStateProps {
  onDiscover: () => void;
}

export function MyCommentsEmptyState({ onDiscover }: MyCommentsEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.iconRing}>
        <Ionicons name="chatbubble-outline" size={36} color={colors.textMuted} />
      </View>
      <AppText variant="subtitle" center style={styles.title}>
        {t('profile.myComments.emptyTitle')}
      </AppText>
      <AppText variant="bodySmall" muted center style={styles.description}>
        {t('profile.myComments.emptyDescription')}
      </AppText>
      <AppButton
        title={t('profile.myComments.emptyCta')}
        variant="secondary"
        onPress={onDiscover}
        style={styles.cta}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentTint12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.sm,
  },
  title: {
    fontWeight: '600',
  },
  description: {
    lineHeight: 22,
    maxWidth: 320,
  },
  cta: {
    marginTop: spacing.sm,
    alignSelf: 'stretch',
    maxWidth: 320,
  },
});
