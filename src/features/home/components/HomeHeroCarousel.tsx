import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppState,
  FlatList,
  Image,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { HomeHero } from './HomeHero';
import type { HomeItem, HomeTypeFilter } from '../types';
import {
  getActiveIndexFromScrollIndex,
  getHeroCarouselActiveIndexFromOffset,
  getScrollIndexForActiveIndex,
  HERO_CAROUSEL_LOOP_HEAD_INDEX,
} from '../utils/home-hero-carousel-index';
import {
  getHomeHeroCardWidth,
  getHomeHeroHeight,
  getHomeHeroSnapInterval,
  HERO_CAROUSEL_SIDE_INSET,
} from '../utils/home-hero-layout';
import { areHomeItemsVisuallyEqual } from '../utils/home-list-keys';
import { createHomeContentKey } from '../utils/selectHeroCandidates';
import { resolveImageUri } from '@/utils/image-url';
import { spacing } from '@/theme/spacing';

const AUTO_ADVANCE_MS = 6000;
const SCROLL_EVENT_THROTTLE_MS = 32;

function buildLoopedHeroItems(items: HomeItem[]): HomeItem[] {
  if (items.length <= 1) {
    return items;
  }

  return [items[items.length - 1], ...items, items[0]];
}

interface HomeHeroCarouselProps {
  items: HomeItem[];
  filterKey: HomeTypeFilter;
  onItemPress: (item: HomeItem) => void;
  isScreenFocused?: boolean;
}

function areHomeHeroCarouselPropsEqual(
  previous: HomeHeroCarouselProps,
  next: HomeHeroCarouselProps,
): boolean {
  if (
    previous.filterKey !== next.filterKey ||
    previous.onItemPress !== next.onItemPress ||
    previous.isScreenFocused !== next.isScreenFocused
  ) {
    return false;
  }

  if (previous.items.length !== next.items.length) {
    return false;
  }

  return previous.items.every((item, index) =>
    areHomeItemsVisuallyEqual(item, next.items[index]),
  );
}

export const HomeHeroCarousel = memo(function HomeHeroCarousel({
  items,
  filterKey,
  onItemPress,
  isScreenFocused = true,
}: HomeHeroCarouselProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const heroHeight = useMemo(() => getHomeHeroHeight(width), [width]);
  const cardWidth = useMemo(() => getHomeHeroCardWidth(width), [width]);
  const snapInterval = useMemo(() => getHomeHeroSnapInterval(width), [width]);
  const listRef = useRef<FlatList<HomeItem>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isAppActive, setIsAppActive] = useState(AppState.currentState === 'active');
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousCarouselKeyRef = useRef<string | null>(null);
  const loopedItems = useMemo(() => buildLoopedHeroItems(items), [items]);
  const heroItemsKey = useMemo(
    () => items.map((item) => createHomeContentKey(item)).join('|'),
    [items],
  );

  const clearAutoAdvanceTimer = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const nextCarouselKey = `${filterKey}:${heroItemsKey}`;
    if (previousCarouselKeyRef.current === nextCarouselKey) {
      return;
    }

    previousCarouselKeyRef.current = nextCarouselKey;
    setActiveIndex(0);
    setIsInteracting(false);
    listRef.current?.scrollToOffset({
      offset: items.length > 1 ? snapInterval * HERO_CAROUSEL_LOOP_HEAD_INDEX : 0,
      animated: false,
    });
  }, [filterKey, heroItemsKey, items.length, snapInterval]);

  useEffect(() => {
    clearAutoAdvanceTimer();

    if (items.length <= 1 || isInteracting || !isAppActive || !isScreenFocused) {
      return clearAutoAdvanceTimer;
    }

    autoAdvanceTimerRef.current = setTimeout(() => {
      const nextIndex = (activeIndex + 1) % items.length;
      listRef.current?.scrollToOffset({
        offset: getScrollIndexForActiveIndex(nextIndex) * snapInterval,
        animated: true,
      });
    }, AUTO_ADVANCE_MS);

    return clearAutoAdvanceTimer;
  }, [
    activeIndex,
    clearAutoAdvanceTimer,
    isAppActive,
    isInteracting,
    isScreenFocused,
    items.length,
    snapInterval,
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      setIsAppActive(nextState === 'active');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (items.length <= 1) {
      return;
    }

    const nextItem = items[(activeIndex + 1) % items.length];
    if (!nextItem) {
      return;
    }

    const nextUri = resolveImageUri(nextItem.backdropUrl ?? nextItem.posterUrl);
    if (nextUri) {
      void Image.prefetch(nextUri);
    }
  }, [activeIndex, items]);

  const handleScrollSettled = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (items.length <= 1) {
        setIsInteracting(false);
        return;
      }

      const scrollIndex = Math.round(event.nativeEvent.contentOffset.x / snapInterval);
      const nextActiveIndex = getActiveIndexFromScrollIndex(scrollIndex, items.length);
      setActiveIndex(nextActiveIndex);

      if (scrollIndex === 0) {
        listRef.current?.scrollToOffset({
          offset: items.length * snapInterval,
          animated: false,
        });
      } else if (scrollIndex === items.length + 1) {
        listRef.current?.scrollToOffset({
          offset: HERO_CAROUSEL_LOOP_HEAD_INDEX * snapInterval,
          animated: false,
        });
      }

      setIsInteracting(false);
    },
    [items.length, snapInterval],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (items.length <= 1) {
        return;
      }

      const nextActiveIndex = getHeroCarouselActiveIndexFromOffset(
        event.nativeEvent.contentOffset.x,
        snapInterval,
        items.length,
      );
      setActiveIndex((previous) => (previous === nextActiveIndex ? previous : nextActiveIndex));
    },
    [items.length, snapInterval],
  );

  const handleScrollBeginDrag = useCallback(() => {
    setIsInteracting(true);
    clearAutoAdvanceTimer();
  }, [clearAutoAdvanceTimer]);

  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const velocityX = event.nativeEvent.velocity?.x ?? 0;
      if (Math.abs(velocityX) < 0.05) {
        handleScrollSettled(event);
      }
    },
    [handleScrollSettled],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<HomeItem> | null | undefined, index: number) => ({
      length: snapInterval,
      offset: snapInterval * index,
      index,
    }),
    [snapInterval],
  );

  const keyExtractor = useCallback(
    (item: HomeItem, index: number) => `${index}:${createHomeContentKey(item)}`,
    [],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<HomeItem>) => (
      <View style={[styles.slide, { width: snapInterval }]}>
        <HomeHero
          item={item}
          heroHeight={heroHeight}
          cardWidth={cardWidth}
          embedded
          onPress={onItemPress}
        />
      </View>
    ),
    [cardWidth, heroHeight, onItemPress, snapInterval],
  );

  if (items.length === 0) {
    return null;
  }

  if (items.length === 1) {
    return (
      <View style={styles.singleItemShell}>
        <HomeHero
          item={items[0]}
          heroHeight={heroHeight}
          cardWidth={cardWidth}
          onPress={() => onItemPress(items[0])}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={loopedItems}
        horizontal
        bounces={false}
        decelerationRate="fast"
        directionalLockEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={styles.listContent}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialScrollIndex={HERO_CAROUSEL_LOOP_HEAD_INDEX}
        onScroll={handleScroll}
        scrollEventThrottle={SCROLL_EVENT_THROTTLE_MS}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleScrollSettled}
        initialNumToRender={Math.min(loopedItems.length, 3)}
        maxToRenderPerBatch={2}
        windowSize={3}
        accessibilityRole="adjustable"
        accessibilityLabel={t('home.slideOf', { current: activeIndex + 1, total: items.length })}
        accessibilityHint={t('home.featuredCarousel')}
      />
    </View>
  );
}, areHomeHeroCarouselPropsEqual);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  singleItemShell: {
    paddingHorizontal: HERO_CAROUSEL_SIDE_INSET,
  },
  listContent: {
    paddingHorizontal: HERO_CAROUSEL_SIDE_INSET,
  },
  slide: {
    overflow: 'visible',
    alignItems: 'flex-start',
  },
});
