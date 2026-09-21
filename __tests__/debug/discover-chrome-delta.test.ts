import {
  DISCOVER_CHROME_STAGE_DEFINITIONS,
  DISCOVER_STAGE4_TO_PRODUCTION_DELTA,
} from '@/debug/discover-chrome-delta';

describe('discover chrome delta', () => {
  it('documents incremental chrome stages 4A through 4E', () => {
    expect(DISCOVER_CHROME_STAGE_DEFINITIONS['4A'].newDelta).toContain('SafeAreaView shell');
    expect(DISCOVER_CHROME_STAGE_DEFINITIONS['4B'].newDelta).toContain('DetailBackButton');
    expect(DISCOVER_CHROME_STAGE_DEFINITIONS['4C'].newDelta).toContain('ActiveFilterChips');
    expect(DISCOVER_CHROME_STAGE_DEFINITIONS['4D'].newDelta).toContain('refreshControl');
    expect(DISCOVER_CHROME_STAGE_DEFINITIONS['4E'].newDelta).toContain('DiscoverFilterSheet');
    expect(DISCOVER_STAGE4_TO_PRODUCTION_DELTA.length).toBeGreaterThan(0);
  });
});
