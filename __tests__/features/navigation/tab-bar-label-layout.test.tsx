import {
  labelFitsWithAdjustsFontSizeToFit,
  PRIMARY_TAB_BAR_HORIZONTAL_LAYOUT,
  PRIMARY_TAB_COUNT,
  resolveActualPrimaryTabLabelWidth,
  resolveRequiredFontScaleForLabel,
  TAB_BAR_LABEL_MINIMUM_FONT_SCALE,
  TURKISH_EDGE_TAB_LABELS,
} from '@/features/navigation/tab-bar-label-layout';

const WIDTHS = {
  iphone13Pro: 390,
  iphone16Pro: 402,
  iphone16Plus: 430,
} as const;

function expectedLabelWidth(screenWidth: number): number {
  return (
    (screenWidth -
      PRIMARY_TAB_BAR_HORIZONTAL_LAYOUT.shellPaddingHorizontal * 2 -
      PRIMARY_TAB_BAR_HORIZONTAL_LAYOUT.tabRowPaddingHorizontal * 2) /
      PRIMARY_TAB_COUNT -
    PRIMARY_TAB_BAR_HORIZONTAL_LAYOUT.tabButtonPaddingHorizontal * 2 -
    PRIMARY_TAB_BAR_HORIZONTAL_LAYOUT.labelPaddingHorizontal * 2
  );
}

describe('PrimaryTabBar actual label width model', () => {
  it('accounts for tab-row and tab-button horizontal spacing from the layout contract', () => {
    const screenWidth = WIDTHS.iphone16Pro;

    expect(resolveActualPrimaryTabLabelWidth(screenWidth)).toBe(expectedLabelWidth(screenWidth));
    expect(PRIMARY_TAB_BAR_HORIZONTAL_LAYOUT.iconWidth).toBe(24);
    expect(PRIMARY_TAB_COUNT).toBe(5);
  });

  it.each([
    ['390pt (iPhone 13 Pro)', WIDTHS.iphone13Pro],
    ['402pt (iPhone 16 Pro)', WIDTHS.iphone16Pro],
    ['430pt', WIDTHS.iphone16Plus],
  ])('label width at %s', (_label, screenWidth) => {
    expect(resolveActualPrimaryTabLabelWidth(screenWidth)).toBe(expectedLabelWidth(screenWidth));
  });

  it('fits Ana Sayfa and İstatistikler at 402pt when adjustsFontSizeToFit can scale', () => {
    const labelWidth = resolveActualPrimaryTabLabelWidth(WIDTHS.iphone16Pro);
    const { home, insights } = TURKISH_EDGE_TAB_LABELS;
    const insightsScale = resolveRequiredFontScaleForLabel(insights, labelWidth);

    expect(labelFitsWithAdjustsFontSizeToFit(home, WIDTHS.iphone16Pro)).toBe(true);
    expect(resolveRequiredFontScaleForLabel(home, labelWidth)).toBe(1);

    expect(insightsScale).toBeLessThanOrEqual(1);
    expect(insightsScale).toBeGreaterThanOrEqual(TAB_BAR_LABEL_MINIMUM_FONT_SCALE);
    expect(labelFitsWithAdjustsFontSizeToFit(insights, WIDTHS.iphone16Pro)).toBe(true);
  });
});
