import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import type { RouteLayoutContext } from '@/debug/route-layout-probe';
import type { SearchResultItem } from '@/features/search/types';

interface RenderSearchResultRowOptions {
  layoutScope: string;
  route: RouteLayoutContext;
  item: SearchResultItem;
  index: number;
  onPress: (item: SearchResultItem) => void;
}

export function renderSearchResultRow({
  item,
  onPress,
}: RenderSearchResultRowOptions) {
  return <SearchResultCard item={item} onPress={onPress} />;
}
