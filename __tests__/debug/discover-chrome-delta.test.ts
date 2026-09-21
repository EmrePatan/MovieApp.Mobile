import {
  DISCOVER_4D8_RECONSTRUCTS_OLD_4D,
  DISCOVER_CHROME_STAGE_DEFINITIONS,
  DISCOVER_CHROME_STAGE_ORDER,
  DISCOVER_OLD_4C_TO_4D_DELTA,
  DISCOVER_STAGE4_TO_PRODUCTION_DELTA,
  isDiscoverChromeStageAtLeast,
} from '@/debug/discover-chrome-delta';

describe('discover chrome delta', () => {
  it('documents incremental chrome stages 4A through 4E', () => {
    expect(DISCOVER_CHROME_STAGE_DEFINITIONS['4A'].newDelta).toContain('SafeAreaView shell');
    expect(DISCOVER_CHROME_STAGE_DEFINITIONS['4B'].newDelta).toContain('DetailBackButton');
    expect(DISCOVER_CHROME_STAGE_DEFINITIONS['4C'].newDelta).toContain('ActiveFilterChips');
    expect(DISCOVER_CHROME_STAGE_DEFINITIONS['4D1'].newDelta).toContain('commonStyles.screen');
    expect(DISCOVER_CHROME_STAGE_DEFINITIONS['4D8'].newDelta).toContain('reconstructs old failing 4D');
    expect(DISCOVER_CHROME_STAGE_DEFINITIONS['4E'].newDelta).toContain('DiscoverFilterSheet');
    expect(DISCOVER_STAGE4_TO_PRODUCTION_DELTA.length).toBeGreaterThan(0);
  });

  it('orders 4D sub-stages between 4C and 4E', () => {
    expect(DISCOVER_CHROME_STAGE_ORDER).toEqual([
      '4A',
      '4B',
      '4C',
      '4D1',
      '4D2',
      '4D3',
      '4D4',
      '4D5',
      '4D6',
      '4D7',
      '4D8',
      '4E',
    ]);
    expect(isDiscoverChromeStageAtLeast('4D3', '4D2')).toBe(true);
    expect(isDiscoverChromeStageAtLeast('4C', '4D1')).toBe(false);
  });

  it('documents old 4C to 4D bundled delta and 4D8 reconstruction', () => {
    expect(DISCOVER_OLD_4C_TO_4D_DELTA.length).toBeGreaterThan(0);
    expect(DISCOVER_4D8_RECONSTRUCTS_OLD_4D).toContain('refreshControl');
    expect(DISCOVER_4D8_RECONSTRUCTS_OLD_4D).not.toContain('DiscoverFilterSheet');
  });
});
