import {
  labelFitsWithAdjustsFontSizeToFit,
  PRIMARY_TAB_BAR_HORIZONTAL_LAYOUT,
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

describe('PrimaryTabBar actual label width model', () => {
  it('accounts for tab-row and tab-button horizontal spacing from the layout contract', () => {
    const screenWidth = WIDTHS.iphone16Pro;
    const expected =
      (screenWidth -
        PRIMARY_TAB_BAR_HORIZONTAL_LAYOUT.shellPaddingHorizontal * 2 -
        PRIMARY_TAB_BAR_HORIZONTAL_LAYOUT.tabRowPaddingHorizontal * 2) /
        4 -
      PRIMARY_TAB_BAR_HORIZONTAL_LAYOUT.tabButtonPaddingHorizontal * 2 -
      PRIMARY_TAB_BAR_HORIZONTAL_LAYOUT.labelPaddingHorizontal * 2;

    expect(resolveActualPrimaryTabLabelWidth(screenWidth)).toBe(expected);
    expect(PRIMARY_TAB_BAR_HORIZONTAL_LAYOUT.iconWidth).toBeGreaterThan(0);
  });

  it.each([
    ['390pt (iPhone 13 Pro)', WIDTHS.iphone13Pro, 97.5],
    ['402pt (iPhone 16 Pro)', WIDTHS.iphone16Pro, 100.5],
    ['430pt', WIDTHS.iphone16Plus, 107.5],
  ])('label width at %s', (_label, screenWidth, expectedLabelWidth) => {
    expect(resolveActualPrimaryTabLabelWidth(screenWidth)).toBe(expectedLabelWidth);
  });

  it('fits Ana Sayfa and İstatistikler at 402pt when adjustsFontSizeToFit can scale', () => {
    const labelWidth = resolveActualPrimaryTabLabelWidth(WIDTHS.iphone16Pro);
    const { home, insights } = TURKISH_EDGE_TAB_LABELS;

    expect(labelFitsWithAdjustsFontSizeToFit(home, WIDTHS.iphone16Pro)).toBe(true);
    expect(resolveRequiredFontScaleForLabel(home, labelWidth)).toBe(1);

    expect(labelFitsWithAdjustsFontSizeToFit(insights, WIDTHS.iphone16Pro)).toBe(true);
    expect(resolveRequiredFontScaleForLabel(insights, labelWidth)).toBeGreaterThanOrEqual(
      TAB_BAR_LABEL_MINIMUM_FONT_SCALE,
    );
    expect(resolveRequiredFontScaleForLabel(insights, labelWidth)).toBeLessThan(1);
  });
});
