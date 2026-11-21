import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';
import { socialFeedTheme } from './social-feed-theme';

interface SocialSubscreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  trailing?: ReactNode;
}

export function SocialSubscreenHeader({
  title,
  subtitle,
  onBack,
  trailing,
}: SocialSubscreenHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('social.back')}
          onPress={onBack}
          hitSlop={8}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={20} color={socialFeedTheme.textPrimary} />
        </Pressable>
        <View style={styles.copy}>
          <AppText numberOfLines={1} style={styles.title} maxFontSizeMultiplier={1.25}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText numberOfLines={2} style={styles.subtitle} maxFontSizeMultiplier={1.3}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {trailing ?? <View style={styles.trailingSpacer} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: socialFeedTheme.border,
    backgroundColor: socialFeedTheme.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.touchTarget,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: socialFeedTheme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: socialFeedTheme.border,
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: socialFeedTheme.textPrimary,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: socialFeedTheme.textSecondary,
  },
  trailingSpacer: {
    width: 36,
    flexShrink: 0,
  },
  pressed: {
    opacity: 0.88,
  },
});
