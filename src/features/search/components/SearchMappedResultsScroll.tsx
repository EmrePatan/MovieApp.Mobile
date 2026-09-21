import { useCallback, type ReactNode } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useRouteLayoutContext } from '@/debug/route-layout-probe';
import { renderSearchResultRow } from '@/features/search/utils/render-search-result-row';
import type { SearchResultItem } from '@/features/search/types';

interface RenderResultRowOptions {
  route: ReturnType<typeof useRouteLayoutContext>;
  item: SearchResultItem;
  index: number;
  onPress: (item: SearchResultItem) => void;
}

interface SearchMappedResultsScrollProps {
  layoutScope: string;
  testID: string;
  items: SearchResultItem[];
  keyExtractor: (item: SearchResultItem) => string;
  onPress: (item: SearchResultItem) => void;
  renderRow?: (options: RenderResultRowOptions) => ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  refreshControl?: ScrollViewProps['refreshControl'];
  footer?: ReactNode;
  onEndReached?: () => void;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  keyboardDismissMode?: ScrollViewProps['keyboardDismissMode'];
}

export function SearchMappedResultsScroll({
  layoutScope,
  testID,
  items,
  keyExtractor,
  onPress,
  renderRow,
  contentContainerStyle,
  style,
  refreshControl,
  footer,
  onEndReached,
  keyboardShouldPersistTaps,
  keyboardDismissMode,
}: SearchMappedResultsScrollProps) {
  const route = useRouteLayoutContext();
  const rowRenderer = renderRow ?? ((options) => renderSearchResultRow({
    layoutScope,
    route: options.route,
    item: options.item,
    index: options.index,
    onPress: options.onPress,
  }));

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!onEndReached) {
        return;
      }

      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const distanceFromBottom =
        contentSize.height - layoutMeasurement.height - contentOffset.y;

      if (distanceFromBottom < 120) {
        onEndReached();
      }
    },
    [onEndReached],
  );

  return (
    <View
      testID={`${testID}-host`}
      style={[styles.host, style]}
      collapsable={false}
    >
      <ScrollView
        testID={testID}
        style={styles.scroll}
        contentContainerStyle={contentContainerStyle}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        keyboardDismissMode={keyboardDismissMode}
        onScroll={onEndReached ? handleScroll : undefined}
        scrollEventThrottle={400}
      >
        {items.map((item, index) => (
          <View key={keyExtractor(item)} collapsable={false}>
            {rowRenderer({ route, item, index, onPress })}
          </View>
        ))}
        {footer}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
    minHeight: 0,
  },
  scroll: {
    flex: 1,
  },
});

export const searchMappedResultsHostStyle = styles.host;
export const searchMappedResultsScrollStyle = styles.scroll;
