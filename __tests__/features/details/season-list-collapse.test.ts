import {
  getVisibleSeasons,
  shouldCollapseSeasonList,
} from '@/features/details/tv/utils/season-list-collapse';

describe('season list collapse', () => {
  const seasons = Array.from({ length: 8 }, (_, index) => `season-${index + 1}`);

  it('collapses long season lists by default', () => {
    expect(shouldCollapseSeasonList(8)).toBe(true);
    expect(getVisibleSeasons(seasons, false)).toEqual(['season-1', 'season-2', 'season-3']);
  });

  it('shows every season when expanded or short', () => {
    expect(getVisibleSeasons(seasons, true)).toEqual(seasons);
    expect(shouldCollapseSeasonList(3)).toBe(false);
    expect(getVisibleSeasons(['a', 'b', 'c'], false)).toEqual(['a', 'b', 'c']);
  });
});
