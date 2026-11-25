import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { socialFeedTheme } from './social-feed-theme';

/** Empty-state CTA for the social feed. */
export function SocialFeedFindPeopleButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('social.findPeople')}
      onPress={onPress}
      style={({ pressed }) => [styles.findBtn, pressed && styles.pressed]}
    >
      <AppText style={styles.findLabel}>{t('social.findPeople')}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  findBtn: {
    minHeight: layout.touchTarget,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: socialFeedTheme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: socialFeedTheme.border,
  },
  findLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: socialFeedTheme.textPrimary,
  },
  pressed: {
    opacity: 0.88,
  },
});
