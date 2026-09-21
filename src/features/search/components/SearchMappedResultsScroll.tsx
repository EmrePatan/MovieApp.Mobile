import { useCallback, useEffect, type ReactNode } from 'react';
import {
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

interface SearchMappedResultsScrollProps {
  layoutScope: string;
  testID: string;
  items: SearchResultItem[];
  keyExtractor: (item: SearchResultItem) => string;
  onPress: (item: SearchResultItem) => void;
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
  contentContainerStyle,
  style,
  refreshControl,
  footer,
  onEndReached,
  keyboardShouldPersistTaps,
  keyboardDismissMode,
}: SearchMappedResultsScrollProps) {
  const route = useRouteLayoutContext();

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
      onLayout={routeLayoutHandler(layoutScope, 'scroll', route, {
        testID,
        renderer: 'ScrollView',
        dataCount: items.length,
        style: describeViewStyle(style),
        contentContainerStyle: describeViewStyle(contentContainerStyle),
      })}
    >
      {items.map((item, index) => (
        <View key={keyExtractor(item)}>
          {renderSearchResultRow({ layoutScope, route, item, index, onPress })}
        </View>
      ))}
      {footer}
    </ScrollView>
  );
}
