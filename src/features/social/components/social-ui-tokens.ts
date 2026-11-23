import { StyleSheet } from 'react-native';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { socialFeedTheme } from './social-feed-theme';

export const SOCIAL_POSTER = layout.posterCatalogRow;

/** Compact catalog reference poster — 2:3, sized relative to feed density. */
export const SOCIAL_POSTER_FEED = { width: 58, height: 87 } as const;

/** @deprecated Unused side-media token; feed uses aspect-ratio bands. */
export const SOCIAL_FEED_SIDE_MEDIA = { width: 120, height: 88 } as const;

export const SOCIAL_AVATAR = layout.avatarSm;
export const SOCIAL_AVATAR_FEED = 28;
/** Identity row avatar on the feed card. */
export const SOCIAL_AVATAR_FEED_ROW = 40;
/** @deprecated Prefer SOCIAL_AVATAR_FEED_ROW */
export const SOCIAL_TWITTER_AVATAR = SOCIAL_AVATAR_FEED_ROW;

/** Shared vertical rhythm for feed, profile activity list, and comment thread. */
export const socialFeedSpacing = {
  rowPaddingVertical: spacing.md,
  blockGap: spacing.sm,
  tabPaddingTop: spacing.sm,
  tabPaddingBottom: spacing.xs,
  profileHeaderPaddingBottom: spacing.sm,
  engagementActionsGap: spacing.sm,
} as const;

export const socialUi = StyleSheet.create({
  pressed: {
    opacity: 0.88,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: socialFeedTheme.border,
    marginHorizontal: layout.screenPaddingHorizontal,
  },
});
