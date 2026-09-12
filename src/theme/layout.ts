import { spacing } from './spacing';

export const layout = {
  screenPaddingHorizontal: spacing.lg,
  screenPaddingVertical: spacing.lg,
  sectionGap: spacing.lg,
  cardGap: spacing.md,
  maxContentWidth: 480,
  touchTarget: 44,
  posterAspectRatio: 2 / 3,
  posterCarousel: {
    width: 132,
    height: 198,
  },
  posterList: {
    width: 72,
    height: 108,
  },
  avatarSm: 36,
  horizontalList: {
    initialNumToRender: 4,
    maxToRenderPerBatch: 6,
    windowSize: 5,
  },
} as const;
