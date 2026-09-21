import { View } from 'react-native';
import {
  logRouteLayoutMeta,
  routeLayoutHandler,
  type RouteLayoutContext,
} from '@/debug/route-layout-probe';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import type { SearchResultItem } from '@/features/search/types';

interface RenderSearchResultRowOptions {
  layoutScope: string;
  route: RouteLayoutContext;
  item: SearchResultItem;
  index: number;
  onPress: (item: SearchResultItem) => void;
}

export function renderSearchResultRow({
  layoutScope,
  route,
  item,
  index,
  onPress,
}: RenderSearchResultRowOptions) {
  if (__DEV__ && index === 0) {
    logRouteLayoutMeta(layoutScope, route, {
      renderItemIndex0: true,
      itemComponent: 'SearchResultCard',
      itemId: item.id,
    });
  }

  return (
    <View
      collapsable={false}
      onLayout={
        index === 0
          ? routeLayoutHandler(layoutScope, 'item:index0', route, {
              itemComponent: 'SearchResultCard',
              itemId: item.id,
            })
          : undefined
      }
    >
      <View
        collapsable={false}
        onLayout={
          index === 0
            ? routeLayoutHandler(layoutScope, 'card:index0', route, {
                itemComponent: 'SearchResultCard',
                itemId: item.id,
              })
            : undefined
        }
      >
        <SearchResultCard item={item} onPress={onPress} />
      </View>
    </View>
  );
}
