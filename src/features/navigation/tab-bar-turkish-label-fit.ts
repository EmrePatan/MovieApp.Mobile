import { spacing } from '@/theme/spacing';

/** Keep in sync with `TAB_BAR_ROW_HORIZONTAL_INSET` in tab-bar-layout-metrics.ts */
const TAB_ROW_HORIZONTAL_INSET = spacing.sm;

/** Tab label typography in PrimaryTabBar (caption 12pt semibold). */
export const TAB_BAR_LABEL_FONT_SIZE = 12;

/**
 * Conservative average glyph width at 12pt semibold (SF Pro–like, Turkish included).
 * Used for layout audits only — not a substitute for on-device measurement.
 */
export const TAB_BAR_LABEL_ESTIMATED_CHAR_WIDTH = 7.1;

const TURKISH_TAB_LABELS = ['Ana Sayfa', 'Keşfet', 'Kütüphane', 'İstatistikler'] as const;

export function resolvePrimaryTabLabelTextBudget(screenWidthPoints: number): number {
  const rowInnerWidth = screenWidthPoints - TAB_ROW_HORIZONTAL_INSET * 2;
  const tabColumnWidth = rowInnerWidth / 4;
  return tabColumnWidth - spacing.xs * 2;
}

export function estimateLabelWidthPoints(label: string): number {
  return label.length * TAB_BAR_LABEL_ESTIMATED_CHAR_WIDTH;
}

export function estimateWidestTurkishTabLabelWidth(): number {
  return Math.max(...TURKISH_TAB_LABELS.map(estimateLabelWidthPoints));
}

export function isTurkishTabLabelBudgetTight(screenWidthPoints: number): boolean {
  const budget = resolvePrimaryTabLabelTextBudget(screenWidthPoints);
  const widest = estimateWidestTurkishTabLabelWidth();
  return widest > budget - 1;
}
