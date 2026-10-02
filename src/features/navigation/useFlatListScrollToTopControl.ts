import { useCallback, useRef, useState, type RefObject } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { scrollFlatListToTop } from '@/features/navigation/scroll-to-top';
import { resolveScrollToTopFabVisible } from './scroll-to-top-fab-visibility';

type ScrollableFlatList = {
  scrollToOffset: (params: { offset: number; animated?: boolean }) => void;
};

export function useFlatListScrollToTopControl(
  listRef: RefObject<ScrollableFlatList | null>,
) {
  const [fabVisible, setFabVisible] = useState(false);
  const fabVisibleRef = useRef(false);

  const onListScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const nextVisible = resolveScrollToTopFabVisible(offsetY, fabVisibleRef.current);

    if (nextVisible === fabVisibleRef.current) {
      return;
    }

    fabVisibleRef.current = nextVisible;
    setFabVisible(nextVisible);
  }, []);

  const scrollToTop = useCallback(() => {
    scrollFlatListToTop(listRef);
    fabVisibleRef.current = false;
    setFabVisible(false);
  }, [listRef]);

  return {
    fabVisible,
    onListScroll,
    scrollToTop,
    scrollEventThrottle: 16 as const,
  };
}
