import { forwardRef, useCallback, useMemo, useRef, type Ref } from 'react';
import type React from 'react';
import {
  FlatList,
  type FlatListProps,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
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

function PlatformRefreshFlatListInner<ItemT>(
  {
    refreshing,
    onRefresh,
    ListHeaderComponent,
    onScroll,
    scrollEventThrottle,
    ...flatListProps
  }: PlatformRefreshFlatListProps<ItemT>,
  ref: React.Ref<FlatList<ItemT>>,
) {
  const onScrollRef = useRef(onScroll);
  onScrollRef.current = onScroll;

  const notifyScrollOffset = useCallback((offsetY: number) => {
    onScrollRef.current?.({
      nativeEvent: {
        contentOffset: { x: 0, y: offsetY },
        contentSize: { width: 0, height: 0 },
        layoutMeasurement: { width: 0, height: 0 },
      },
    } as NativeSyntheticEvent<NativeScrollEvent>);
  }, []);

  const refreshControl = useMemo(
    () => createIosRefreshControl({ refreshing, onRefresh }),
    [onRefresh, refreshing],
  );

  const androidPullToRefresh = useAndroidPullToRefresh({
    refreshing,
    onRefresh,
    onScrollOffset: onScroll ? notifyScrollOffset : undefined,
  });

  const mergedListHeader = useMemo(
    () => mergePlatformListHeader(androidPullToRefresh.RefreshHeader, ListHeaderComponent),
    [ListHeaderComponent, androidPullToRefresh.RefreshHeader],
  );

  const list = (
    <AnimatedFlatList
      ref={ref}
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

export const PlatformRefreshFlatList = forwardRef(PlatformRefreshFlatListInner) as <
  ItemT,
>(
  props: PlatformRefreshFlatListProps<ItemT> & { ref?: React.Ref<FlatList<ItemT>> },
) => React.ReactElement | null;
