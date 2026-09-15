import {
  formatFavoritesSubtitle,
  formatFollowingSubtitle,
  formatWatchHistorySubtitle,
  formatWatchlistSubtitle,
} from '@/features/profile/utils/library-copy';

describe('library-copy', () => {
  it('formats favorites subtitles with singular and plural copy', () => {
    expect(formatFavoritesSubtitle(1)).toBe('1 saved title');
    expect(formatFavoritesSubtitle(6)).toBe('6 saved titles');
  });

  it('formats watchlist subtitles with singular and plural copy', () => {
    expect(formatWatchlistSubtitle(1)).toBe('1 list');
    expect(formatWatchlistSubtitle(2)).toBe('2 lists');
  });

  it('formats watch history subtitles with separate movie and episode counts', () => {
    expect(formatWatchHistorySubtitle(1, 1)).toBe('1 movie · 1 episode');
    expect(formatWatchHistorySubtitle(12, 48)).toBe('12 movies · 48 episodes');
  });

  it('formats following subtitles with singular and plural copy', () => {
    expect(formatFollowingSubtitle(1)).toBe('1 followed title');
    expect(formatFollowingSubtitle(4)).toBe('4 followed titles');
  });
});
