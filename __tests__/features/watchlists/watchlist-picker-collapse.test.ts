import {
  getVisibleWatchlists,
  shouldCollapseWatchlistPicker,
} from '@/features/watchlists/utils/watchlist-picker-collapse';

describe('watchlist-picker-collapse', () => {
  it('collapses lists beyond the preview count', () => {
    const lists = [
      { id: 'a', name: 'Alpha', itemCount: 1 },
      { id: 'b', name: 'Beta', itemCount: 5 },
      { id: 'c', name: 'Gamma', itemCount: 3 },
      { id: 'd', name: 'Delta', itemCount: 4 },
      { id: 'e', name: 'Epsilon', itemCount: 2 },
    ];

    expect(shouldCollapseWatchlistPicker(lists.length)).toBe(true);
    expect(getVisibleWatchlists(lists, false)).toEqual([
      { id: 'b', name: 'Beta', itemCount: 5 },
      { id: 'd', name: 'Delta', itemCount: 4 },
    ]);
    expect(getVisibleWatchlists(lists, true)).toEqual(lists);
  });
});
