import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { GlassSurface } from '@/components/common/GlassSurface';
import { authTypography } from '@/features/auth/auth-typography';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
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
  useAuthFonts();

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <GlassSurface style={styles.backBtn}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('social.back')}
            onPress={onBack}
            hitSlop={8}
            style={({ pressed }) => [styles.backHit, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={20} color={socialFeedTheme.textPrimary} />
          </Pressable>
        </GlassSurface>
        <View style={styles.copy}>
          <AppText numberOfLines={2} style={styles.title} maxFontSizeMultiplier={1.25}>
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
    backgroundColor: socialFeedTheme.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.touchTarget,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    flexShrink: 0,
  },
  backHit: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    // Editorial serif, same voice as the feed title.
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 24,
    lineHeight: 30,
    color: socialFeedTheme.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: socialFeedTheme.textSecondary,
  },
  trailingSpacer: {
    width: 40,
    flexShrink: 0,
  },
  pressed: {
    opacity: 0.88,
  },
});
