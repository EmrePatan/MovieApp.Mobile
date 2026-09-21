import type { RefObject } from 'react';
import type { ScrollView } from 'react-native';

type ScrollableFlatList = {
  scrollToOffset: (params: { offset: number; animated?: boolean }) => void;
};

export function scrollFlatListToTop(
  listRef: RefObject<ScrollableFlatList | null>,
  animated = true,
): void {
  listRef.current?.scrollToOffset({ offset: 0, animated });
}

export function scrollScrollViewToTop(
  scrollRef: RefObject<ScrollView | null>,
  animated = true,
): void {
  scrollRef.current?.scrollTo({ y: 0, animated });
}
