import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { glass } from '@/theme/glass';
import { premiumSheet } from '@/theme/premium-sheet';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export type SocialProfileSection = 'library' | 'reviews';

interface SocialProfileSectionTabsProps {
  active: SocialProfileSection;
  reviewsLabel: string;
  onChange: (section: SocialProfileSection) => void;
}

export function SocialProfileSectionTabs({
  active,
  reviewsLabel,
  onChange,
}: SocialProfileSectionTabsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: active === 'library' }}
        onPress={() => onChange('library')}
        style={({ pressed }) => [
          styles.tab,
          active === 'library' && styles.tabActive,
          pressed && styles.pressed,
        ]}
      >
        <AppText style={[styles.label, active === 'library' && styles.labelActive]}>
          {t('social.profileSectionLibrary')}
        </AppText>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: active === 'reviews' }}
        onPress={() => onChange('reviews')}
        style={({ pressed }) => [
          styles.tab,
          active === 'reviews' && styles.tabActive,
          pressed && styles.pressed,
        ]}
      >
        <AppText style={[styles.label, active === 'reviews' && styles.labelActive]}>
          {reviewsLabel}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing.sm,
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: glass.fill,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: glass.accentFill,
    borderColor: glass.accentBorder,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: premiumSheet.textSecondary,
  },
  labelActive: {
    color: premiumSheet.textPrimary,
  },

  pressed: {
    opacity: 0.88,
  },
});
