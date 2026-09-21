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
import { logNavigationDiagnostic } from '@/debug/navigation-diagnostics';
import { renderSearchResultRow } from '@/features/search/utils/render-search-result-row';
import type { SearchResultItem } from '@/features/search/types';

interface SearchMappedResultsScrollProps {
  scope: string;
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

/**
 * Non-virtualized result list for #45 Android routes where FlatList receives
 * data but never invokes renderItem. Page size is 20; accumulated pages grow
 * with infinite scroll — revisit virtualization if session lists become large.
 */
export function SearchMappedResultsScroll({
  scope,
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
  useEffect(() => {
    if (__DEV__) {
      logNavigationDiagnostic(`${scope}:created`, { itemCount: items.length });
    }
  }, [items.length, scope]);

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
    >
      {items.map((item, index) => (
        <View key={keyExtractor(item)}>
          {renderSearchResultRow({ scope, item, index, onPress })}
        </View>
      ))}
      {footer}
    </ScrollView>
  );
}
