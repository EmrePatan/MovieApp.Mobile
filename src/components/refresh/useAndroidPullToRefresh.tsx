import { useCallback, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AndroidPullToRefreshHeader } from './AndroidPullToRefreshHeader';

const TRIGGER_DISTANCE = 72;
const MAX_PULL_DISTANCE = 108;

export interface AndroidPullToRefreshConfig {
  refreshing: boolean;
  onRefresh: () => void;
}

export function useAndroidPullToRefresh({
  refreshing,
  onRefresh,
}: AndroidPullToRefreshConfig) {
  const enabled = Platform.OS === 'android';
  const scrollY = useSharedValue(0);
  const pullDistance = useSharedValue(0);

  const triggerRefresh = useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  useEffect(() => {
    if (!refreshing) {
      pullDistance.value = 0;
    }
  }, [pullDistance, refreshing]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const composedGesture = useMemo(() => {
    if (!enabled) {
      return Gesture.Native();
    }

    const nativeGesture = Gesture.Native();
    const panGesture = Gesture.Pan()
      .activeOffsetY(10)
      .failOffsetX([-12, 12])
      .onUpdate((event) => {
        if (scrollY.value > 0.5) {
          pullDistance.value = 0;
          return;
        }

        if (event.translationY > 0) {
          pullDistance.value = Math.min(event.translationY, MAX_PULL_DISTANCE);
        }
      })
      .onEnd(() => {
        if (pullDistance.value >= TRIGGER_DISTANCE) {
          runOnJS(triggerRefresh)();
        }

        pullDistance.value = withTiming(0, { duration: 200 });
      })
      .onFinalize(() => {
        pullDistance.value = withTiming(0, { duration: 200 });
      });

    return Gesture.Simultaneous(nativeGesture, panGesture);
  }, [enabled, pullDistance, scrollY, triggerRefresh]);

  const RefreshHeader = enabled
    ? <AndroidPullToRefreshHeader pullDistance={pullDistance} refreshing={refreshing} />
    : null;

  return {
    enabled,
    RefreshHeader,
    scrollHandler,
    composedGesture,
  };
}
