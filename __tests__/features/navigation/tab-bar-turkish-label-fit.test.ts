import {
  estimateWidestTurkishTabLabelWidth,
  isTurkishTabLabelBudgetTight,
  resolvePrimaryTabLabelTextBudget,
} from '@/features/navigation/tab-bar-turkish-label-fit';

/** Logical widths (pt) — portrait, standard display zoom. */
const IPHONE_16_PRO_WIDTH = 402;
const IPHONE_16_WIDTH = 393;
const IPHONE_16_PRO_MAX_WIDTH = 440;
const IPHONE_SE_3_WIDTH = 375;

describe('tab-bar Turkish label fit audit', () => {
  it('documents text budget vs estimated widest label (İstatistikler)', () => {
    const widest = estimateWidestTurkishTabLabelWidth();
    const proBudget = resolvePrimaryTabLabelTextBudget(IPHONE_16_PRO_WIDTH);

    expect(widest).toBeGreaterThan(85);
    expect(proBudget).toBeCloseTo(88.5, 1);
  });

  it('flags tight layout on iPhone 16 class widths without font scaling', () => {
    expect(isTurkishTabLabelBudgetTight(IPHONE_16_WIDTH)).toBe(true);
    expect(isTurkishTabLabelBudgetTight(IPHONE_16_PRO_WIDTH)).toBe(true);
    expect(isTurkishTabLabelBudgetTight(IPHONE_SE_3_WIDTH)).toBe(true);
  });

  it('has comfortable budget on Pro Max width', () => {
    expect(isTurkishTabLabelBudgetTight(IPHONE_16_PRO_MAX_WIDTH)).toBe(false);
  });
});
