import { spacing } from '@/theme/spacing';

/** iOS compact bar: minimum visible space below labels (design range floor). */
export const IOS_TAB_BAR_VISUAL_BOTTOM_MIN = 10;

/** iOS compact bar: maximum visible space below labels (design range ceiling). */
export const IOS_TAB_BAR_VISUAL_BOTTOM_MAX = 16;

/**
 * Maps a large system bottom inset to modest visible breathing room below labels.
 * Not 1:1 with safeAreaInsets.bottom — background still fills to the screen bottom.
 */
export const IOS_TAB_BAR_VISUAL_BOTTOM_INSET_RATIO = 0.4;

export function resolveIosTabBarVisualBottomSpacing(bottomInset: number): number {
  if (bottomInset <= 0) {
    return spacing.sm;
  }

  const scaled = Math.round(bottomInset * IOS_TAB_BAR_VISUAL_BOTTOM_INSET_RATIO);
  return Math.min(
    IOS_TAB_BAR_VISUAL_BOTTOM_MAX,
    Math.max(IOS_TAB_BAR_VISUAL_BOTTOM_MIN, scaled),
  );
}
