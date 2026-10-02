/** Keep in sync with `tab-bar-layout-metrics` / `PrimaryTabBar`. */
const TAB_BAR_ICON_SIZE = 22;
const TAB_BAR_LABEL_GAP = 2;

/** Primary tab count in `PrimaryTabBar` — keep in sync. */
export const PRIMARY_TAB_COUNT = 4;

/** `minimumFontScale` on tab labels — keep in sync with `PrimaryTabBar`. */
export const TAB_BAR_LABEL_MINIMUM_FONT_SCALE = 0.85;

/** Tab label typography — keep in sync with `tabBarLabelStyle` (caption 12 + semibold). */
export const TAB_BAR_LABEL_FONT_SIZE = 12;

/**
 * Conservative max intrinsic width for 12pt semibold (layout audit).
 * Used to validate `adjustsFontSizeToFit` headroom, not runtime measurement.
 */
export const TAB_BAR_LABEL_CONSERVATIVE_CHAR_WIDTH = 7.8;

export const TURKISH_EDGE_TAB_LABELS = {
  home: 'Ana Sayfa',
  insights: 'İstatistikler',
} as const;

/**
 * Horizontal layout contract mirrored from `PrimaryTabBar` + `getTabBarStyle`.
 *
 * Hierarchy:
 * shell (getTabBarStyle) → tabRow → Pressable tabButton → Ionicons + AppText label
 *
 * Vertical-only (no horizontal deduction): paddingTop/Bottom on shell, marginTop on label,
 * TAB_BAR_LABEL_GAP, icon height stacked above label.
 */
export const PRIMARY_TAB_BAR_HORIZONTAL_LAYOUT = {
  shellPaddingHorizontal: 0,
  tabRowPaddingHorizontal: 0,
  tabButtonPaddingHorizontal: 0,
  tabButtonMinWidth: 0,
  labelPaddingHorizontal: 0,
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
