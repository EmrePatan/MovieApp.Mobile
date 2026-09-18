import {
  getLibraryGridItemLayout,
  getLibraryGridRowHeight,
} from '@/features/library/utils/library-grid-layout';
import { spacing } from '@/theme/spacing';

const ITEM_HEIGHT = 120;
const GRID_COLUMNS = 3;

describe('library grid layout helpers', () => {
  it('adds watching detail height only for watching category', () => {
    const baseRowHeight = getLibraryGridRowHeight(ITEM_HEIGHT, 'liked');
    const watchingRowHeight = getLibraryGridRowHeight(ITEM_HEIGHT, 'watching');

    expect(watchingRowHeight).toBeGreaterThan(baseRowHeight);
    expect(watchingRowHeight - baseRowHeight).toBe(14 + spacing.xs);
  });

  it('returns row-based offsets for grid items', () => {
    const rowHeight = getLibraryGridRowHeight(ITEM_HEIGHT, 'watchlist');

    expect(getLibraryGridItemLayout(ITEM_HEIGHT, 'watchlist', GRID_COLUMNS, 0)).toEqual({
      length: rowHeight,
      offset: 0,
      index: 0,
    });
    expect(getLibraryGridItemLayout(ITEM_HEIGHT, 'watchlist', GRID_COLUMNS, 3)).toEqual({
      length: rowHeight,
      offset: rowHeight,
      index: 3,
    });
  });
});
