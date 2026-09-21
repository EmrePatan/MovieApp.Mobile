import { useMemo } from 'react';
import { FlatList, type FlatListProps } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { createIosRefreshControl } from './createIosRefreshControl';
import { mergePlatformListHeader } from './mergePlatformListHeader';
import { useAndroidPullToRefresh } from './useAndroidPullToRefresh';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList) as unknown as typeof FlatList;

export interface PlatformRefreshFlatListProps<ItemT>
  extends Omit<FlatListProps<ItemT>, 'refreshControl'> {
  refreshing: boolean;
  onRefresh: () => void;
}

export function PlatformRefreshFlatList<ItemT>({
  refreshing,
  onRefresh,
  ListHeaderComponent,
  onScroll,
  scrollEventThrottle,
  ...flatListProps
}: PlatformRefreshFlatListProps<ItemT>) {
  const refreshControl = useMemo(
    () => createIosRefreshControl({ refreshing, onRefresh }),
    [onRefresh, refreshing],
  );

  const androidPullToRefresh = useAndroidPullToRefresh({
    refreshing,
    onRefresh,
  });

  const mergedListHeader = useMemo(
    () => mergePlatformListHeader(androidPullToRefresh.RefreshHeader, ListHeaderComponent),
    [ListHeaderComponent, androidPullToRefresh.RefreshHeader],
  );

  const list = (
    <AnimatedFlatList
      {...flatListProps}
      ListHeaderComponent={mergedListHeader}
      refreshControl={refreshControl}
      onScroll={androidPullToRefresh.enabled ? androidPullToRefresh.scrollHandler : onScroll}
      scrollEventThrottle={androidPullToRefresh.enabled ? 16 : scrollEventThrottle}
    />
  );

  if (androidPullToRefresh.enabled) {
    return (
      <GestureDetector gesture={androidPullToRefresh.composedGesture}>{list}</GestureDetector>
    );
  }

  return list;
}
