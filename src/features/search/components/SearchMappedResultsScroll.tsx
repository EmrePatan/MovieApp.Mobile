import { useCallback, useEffect, type ReactNode } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { describeViewStyle } from '@/debug/stack-layout-probe';
import { logNavigationDiagnostic } from '@/debug/navigation-diagnostics';
import {
  routeLayoutHandler,
  useRouteLayoutContext,
} from '@/debug/route-layout-probe';
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

  useEffect(() => {
    if (__DEV__) {
      logNavigationDiagnostic(`layout:${layoutScope}:scroll:created`, {
        pathname: route.pathname,
        segments: route.segments,
        itemCount: items.length,
        renderer: 'ScrollView',
        itemComponent: 'SearchResultCard',
      });
    }
  }, [items.length, layoutScope, route.pathname, route.segments]);

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

  const scrollViewportHandler = (event: LayoutChangeEvent) => {
    if (__DEV__ && layoutScope === 'streaming-discover') {
      const { x, y, width, height } = event.nativeEvent.layout;
      logNavigationDiagnostic('streaming-scroll:viewport-layout', {
        pathname: route.pathname,
        x,
        y,
        width,
        height,
      });
    }

    routeLayoutHandler(layoutScope, 'scroll', route, {
      testID,
      renderer: 'ScrollView',
      dataCount: items.length,
      style: describeViewStyle(style),
      contentContainerStyle: describeViewStyle(contentContainerStyle),
    })(event);
  };

  return (
    <ScrollView
      testID={testID}
      style={style}
      contentContainerStyle={contentContainerStyle}
      refreshControl={refreshControl}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      keyboardDismissMode={keyboardDismissMode}
      onScroll={onEndReached ? handleScroll : undefined}
      scrollEventThrottle={400}
      onLayout={scrollViewportHandler}
    >
      <View
        collapsable={false}
        onLayout={
          layoutScope === 'streaming-discover'
            ? (event) => {
                const { x, y, width, height } = event.nativeEvent.layout;
                logNavigationDiagnostic('streaming-scroll:content-layout', {
                  pathname: route.pathname,
                  itemCount: items.length,
                  x,
                  y,
                  width,
                  height,
                });
              }
            : routeLayoutHandler(layoutScope, 'scroll-content', route, {
                itemCount: items.length,
              })
        }
      >
        {items.map((item, index) => (
          <View key={keyExtractor(item)} collapsable={false}>
            {rowRenderer({ route, item, index, onPress })}
          </View>
        ))}
      </View>
      {footer}
    </ScrollView>
  );
}
