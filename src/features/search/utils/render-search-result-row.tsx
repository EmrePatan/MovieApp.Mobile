import { View } from 'react-native';
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
    logNavigationDiagnostic(`${scope}:row:index0`, { itemId: item.id });
    logNavigationDiagnostic(`${scope}:card:index0`, { itemId: item.id });
  }

  const row = (
    <View
      collapsable={false}
      onLayout={(event) => {
        if (!__DEV__ || index !== 0) {
          return;
        }

        const { width, height, x, y } = event.nativeEvent.layout;
        logNavigationDiagnostic(`${scope}:row:layout:index0`, {
          itemId: item.id,
          width,
          height,
          x,
          y,
        });
      }}
    >
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
    </View>
  );

  return row;
}
