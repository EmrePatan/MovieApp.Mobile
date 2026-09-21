import { View } from 'react-native';
import { FlatListRowProbe } from '@/debug/flat-list-row-probe';
import { logNavigationDiagnostic } from '@/debug/navigation-diagnostics';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import type { SearchResultItem } from '@/features/search/types';

interface RenderSearchResultRowOptions {
  scope: string;
  item: SearchResultItem;
  index: number;
  onPress: (item: SearchResultItem) => void;
}

export function renderSearchResultRow({
  scope,
  item,
  index,
  onPress,
}: RenderSearchResultRowOptions) {
  if (__DEV__ && index === 0) {
    logNavigationDiagnostic(`${scope}:card:render:index0`, { itemId: item.id });
  }

  return (
    <FlatListRowProbe scope={scope} index={index} itemId={item.id}>
      <View
        collapsable={false}
        onLayout={(event) => {
          if (!__DEV__ || index !== 0) {
            return;
          }

          const { width, height, x, y } = event.nativeEvent.layout;
          logNavigationDiagnostic(`${scope}:card:layout:index0`, {
            itemId: item.id,
            width,
            height,
            x,
            y,
          });
        }}
      >
        <SearchResultCard item={item} onPress={onPress} />
      </View>
    </FlatListRowProbe>
  );
}
