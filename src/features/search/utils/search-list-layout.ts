import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export const SEARCH_RESULT_ROW_HEIGHT =
  layout.posterList.height + spacing.sm * 2;

export function getSearchResultItemLayout(_data: unknown, index: number) {
  return {
    length: SEARCH_RESULT_ROW_HEIGHT,
    offset: SEARCH_RESULT_ROW_HEIGHT * index,
    index,
  };
}
