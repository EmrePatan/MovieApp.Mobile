import { StyleSheet } from 'react-native';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';
import { socialFeedTheme } from './social-feed-theme';

export const SOCIAL_FEED_AVATAR = 40;
export const SOCIAL_FEED_SHELL_RADIUS = borderRadius.lg;

/** Shared Black Titanium accents for optional tweet/premium shells. */
export const socialFeedPremiumStyles = StyleSheet.create({
  shell: {
    marginHorizontal: layout.screenPaddingHorizontal,
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: SOCIAL_FEED_SHELL_RADIUS,
    backgroundColor: socialFeedTheme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: socialFeedTheme.border,
  },
  avatarRing: {
    padding: 0,
    borderRadius: SOCIAL_FEED_AVATAR,
    borderWidth: 0,
  },
  headline: {
    fontWeight: '700',
    letterSpacing: -0.2,
    color: socialFeedTheme.textPrimary,
  },
  statsLine: {
    color: socialFeedTheme.textSecondary,
  },
  pressed: {
    opacity: 0.88,
  },
});
