import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export const DETAIL_REVIEW_PREVIEW_MAX_ITEMS = 5;
export const DETAIL_REVIEW_PREVIEW_LINE_COUNT = 3;

const CARD_WIDTH_MIN = 280;
const CARD_WIDTH_MAX = 320;
const CARD_HEIGHT_MIN = 140;
const CARD_HEIGHT_MAX = 160;
const CARD_WIDTH_SCREEN_RATIO = 0.84;

/** Extra trailing space so the next card peeks on the right edge. */
export const DETAIL_REVIEW_PREVIEW_TRAILING_PEEK = spacing.lg;

export function getDetailReviewPreviewCardDimensions(screenWidth: number): {
  width: number;
  height: number;
} {
  const contentWidth = screenWidth - layout.screenPaddingHorizontal * 2;
  const width = Math.round(
    Math.min(CARD_WIDTH_MAX, Math.max(CARD_WIDTH_MIN, contentWidth * CARD_WIDTH_SCREEN_RATIO)),
  );
  const height = Math.round(
    Math.min(CARD_HEIGHT_MAX, Math.max(CARD_HEIGHT_MIN, width * 0.5)),
  );

  return { width, height };
}
