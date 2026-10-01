import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Matches hero rating chip padding, border, and caption line. */
export const HOME_HERO_RATING_CHIP_HEIGHT =
  Math.max(12, typography.caption.lineHeight ?? 16) + spacing.xs * 2 + 2;

export const HOME_HERO_METADATA_ROW_HEIGHT = HOME_HERO_RATING_CHIP_HEIGHT;
