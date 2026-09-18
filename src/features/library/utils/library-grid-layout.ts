import { spacing } from '@/theme/spacing';
import type { LibraryCategory } from '../types/library';

const GRID_GAP = spacing.sm;
const CARD_GAP = spacing.xs;
const WATCHING_DETAIL_LINE_HEIGHT = 14;

export function getLibraryGridRowHeight(
  itemHeight: number,
  category: LibraryCategory,
): number {
  const watchingDetailHeight =
    category === 'watching' ? WATCHING_DETAIL_LINE_HEIGHT + CARD_GAP : 0;

  return itemHeight + watchingDetailHeight + CARD_GAP + GRID_GAP;
}

export function getLibraryGridItemLayout(
  itemHeight: number,
  category: LibraryCategory,
  numColumns: number,
  index: number,
) {
  const rowHeight = getLibraryGridRowHeight(itemHeight, category);
  const row = Math.floor(index / numColumns);

  return {
    length: rowHeight,
    offset: row * rowHeight,
    index,
  };
}
