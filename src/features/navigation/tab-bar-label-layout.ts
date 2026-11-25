import {
  TAB_BAR_CONTENT_INSET_H,
  TAB_BAR_ICON_SIZE,
  TAB_BAR_LABEL_FONT_SIZE,
  TAB_BAR_LABEL_GAP,
  TAB_BAR_ROW_PADDING_H,
} from '@/features/navigation/tab-bar-layout-metrics';

/** Primary tab count in `PrimaryTabBar` — keep in sync. */
export const PRIMARY_TAB_COUNT = 5;

/** `minimumFontScale` on tab labels — keep in sync with `PrimaryTabBar`. */
/** Dense 5-tab Turkish labels may scale slightly below 0.8 on compact widths. */
export const TAB_BAR_LABEL_MINIMUM_FONT_SCALE = 0.75;

/** Tab label typography — keep in sync with PrimaryTabBar label style. */
export const TAB_BAR_LABEL_FONT_SIZE_AUDIT = TAB_BAR_LABEL_FONT_SIZE;

/**
 * Conservative max intrinsic width for caption-sized text (layout audit).
 * Used to validate `adjustsFontSizeToFit` headroom, not runtime measurement.
 */
export const TAB_BAR_LABEL_CONSERVATIVE_CHAR_WIDTH = 7.0;

export const TURKISH_EDGE_TAB_LABELS = {
  home: 'Ana Sayfa',
  insights: 'İstatistikler',
} as const;

/**
 * Horizontal layout contract mirrored from `PrimaryTabBar` + `getTabBarStyle`.
 *
 * Hierarchy:
 * shell → tabRow → Pressable tabButton → pill → Ionicons + AppText label
 */
export const PRIMARY_TAB_BAR_HORIZONTAL_LAYOUT = {
  shellPaddingHorizontal: 0,
  tabRowPaddingHorizontal: TAB_BAR_ROW_PADDING_H,
  tabButtonPaddingHorizontal: 0,
  tabButtonMinWidth: 0,
  labelPaddingHorizontal: TAB_BAR_CONTENT_INSET_H,
  labelMarginHorizontal: 0,
  /** Icon is above the label; width does not reduce label line width. */
  iconWidth: TAB_BAR_ICON_SIZE,
  labelMarginTop: TAB_BAR_LABEL_GAP,
} as const;

/**
 * Label drawable width after all horizontal constraints in `PrimaryTabBar`.
 * Icon/label gap is vertical (`marginTop` on label only).
 */
export function resolveActualPrimaryTabLabelWidth(screenWidthPoints: number): number {
  const tabRowInnerWidth =
    screenWidthPoints -
    PRIMARY_TAB_BAR_HORIZONTAL_LAYOUT.shellPaddingHorizontal * 2 -
    PRIMARY_TAB_BAR_HORIZONTAL_LAYOUT.tabRowPaddingHorizontal * 2;

  const tabColumnWidth = tabRowInnerWidth / PRIMARY_TAB_COUNT;

  return (
    tabColumnWidth -
    PRIMARY_TAB_BAR_HORIZONTAL_LAYOUT.tabButtonPaddingHorizontal * 2 -
    PRIMARY_TAB_BAR_HORIZONTAL_LAYOUT.labelPaddingHorizontal * 2
  );
}

export function estimateLabelIntrinsicWidth(label: string): number {
  return label.length * TAB_BAR_LABEL_CONSERVATIVE_CHAR_WIDTH;
}

export function resolveRequiredFontScaleForLabel(label: string, labelWidth: number): number {
  const intrinsic = estimateLabelIntrinsicWidth(label);
  if (intrinsic <= labelWidth) {
    return 1;
  }

  return labelWidth / intrinsic;
}

export function labelFitsWithAdjustsFontSizeToFit(label: string, screenWidthPoints: number): boolean {
  const labelWidth = resolveActualPrimaryTabLabelWidth(screenWidthPoints);
  const requiredScale = resolveRequiredFontScaleForLabel(label, labelWidth);
  return requiredScale >= TAB_BAR_LABEL_MINIMUM_FONT_SCALE;
}
