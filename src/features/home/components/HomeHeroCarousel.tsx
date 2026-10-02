import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  AppState,
  Image,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import { HomeHero } from './HomeHero';
import { HomeHeroMetadata } from './HomeHeroMetadata';
import { HomeHeroPaginationDots } from './HomeHeroPaginationDots';
import type { HomeItem, HomeTypeFilter } from '../types';
import {
  getHeroCarouselActiveIndexFromOffset,
  getScrollIndexForActiveIndex,
  getScrollIndexFromOffset,
  HERO_CAROUSEL_LOOP_HEAD_INDEX,
  resolveHeroCarouselLoopSettledOffset,
} from '../utils/home-hero-carousel-index';
import { HOME_HERO_SEARCH_BREATHING_ROOM } from '../utils/home-hero-layout';
import { useHomeHeroCarouselLayout } from '../hooks/useHomeHeroCarouselLayout';
import { areHomeItemsVisuallyEqual } from '../utils/home-list-keys';
import { createHomeContentKey } from '../utils/selectHeroCandidates';
import { resolveHomeHeroNeighborPrefetchUris } from '../utils/home-hero-image';
import { spacing } from '@/theme/spacing';

const AUTO_ADVANCE_MS = 4000;
const SCROLL_EVENT_THROTTLE_MS = 16;
/** Active slide plus the posters peeking beside it. Do not mount the whole loop. */
const HERO_CAROUSEL_RENDER_WINDOW = 3;

const AnimatedFlatList = Animated.FlatList<HomeItem>;

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
  const includePaginationDots = items.length > 1;
  const { heroHeight, cardWidth, snapInterval, horizontalPadding } =
    useHomeHeroCarouselLayout(includePaginationDots);
  const listRef = useRef<Animated.FlatList<HomeItem>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [centeredScrollIndex, setCenteredScrollIndex] = useState(
    HERO_CAROUSEL_LOOP_HEAD_INDEX,
  );
  const [isInteracting, setIsInteracting] = useState(false);
  const [isAppActive, setIsAppActive] = useState(AppState.currentState === 'active');
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousCarouselKeyRef = useRef<string | null>(null);
  const loopedItems = useMemo(() => buildLoopedHeroItems(items), [items]);
  const heroItemsKey = useMemo(
    () => items.map((item) => createHomeContentKey(item)).join('|'),
    [items],
  );

  const initialScrollOffset =
    items.length > 1 ? snapInterval * HERO_CAROUSEL_LOOP_HEAD_INDEX : 0;
  const scrollX = useRef(new Animated.Value(initialScrollOffset)).current;

  const activeItem = items[activeIndex] ?? items[0];

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
    setCenteredScrollIndex(HERO_CAROUSEL_LOOP_HEAD_INDEX);
    setIsInteracting(false);
    const nextOffset = items.length > 1 ? snapInterval * HERO_CAROUSEL_LOOP_HEAD_INDEX : 0;
    scrollX.setValue(nextOffset);
    listRef.current?.scrollToOffset({
      offset: nextOffset,
      animated: false,
    });
  }, [filterKey, heroItemsKey, items.length, scrollX, snapInterval]);

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
    for (const uri of resolveHomeHeroNeighborPrefetchUris(items, activeIndex)) {
      void Image.prefetch(uri);
    }
  }, [activeIndex, items]);

  const handleScrollSettled = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (items.length <= 1) {
        setIsInteracting(false);
        return;
      }

      const offsetX = event.nativeEvent.contentOffset.x;
      const { activeIndex: nextActiveIndex, settledOffsetX, needsScrollCorrection } =
        resolveHeroCarouselLoopSettledOffset(offsetX, snapInterval, items.length);
      const settledScrollIndex = getScrollIndexFromOffset(settledOffsetX, snapInterval);

      if (needsScrollCorrection) {
        listRef.current?.scrollToOffset({
          offset: settledOffsetX,
          animated: false,
        });
      }

      scrollX.setValue(settledOffsetX);
      setCenteredScrollIndex(settledScrollIndex);
      setActiveIndex(nextActiveIndex);

      setIsInteracting(false);
    },
    [items.length, scrollX, snapInterval],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (items.length <= 1) {
        return;
      }

      const offsetX = event.nativeEvent.contentOffset.x;
      const nextScrollIndex = getScrollIndexFromOffset(offsetX, snapInterval);
      const nextActiveIndex = getHeroCarouselActiveIndexFromOffset(
        offsetX,
        snapInterval,
        items.length,
      );

      setCenteredScrollIndex((previous) =>
        previous === nextScrollIndex ? previous : nextScrollIndex,
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
    ({ item, index }: ListRenderItemInfo<HomeItem>) => (
      <HomeHero
        item={item}
        heroHeight={heroHeight}
        cardWidth={cardWidth}
        embedded
        isActive={index === centeredScrollIndex}
        scrollX={scrollX}
        slideIndex={index}
        snapInterval={snapInterval}
        onPress={onItemPress}
      />
    ),
    [centeredScrollIndex, cardWidth, heroHeight, onItemPress, scrollX, snapInterval],
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
      <View style={[styles.carouselStage, { height: heroHeight }]}>
        <AnimatedFlatList
          testID="home-hero-carousel-list"
          ref={listRef}
          style={styles.carouselList}
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
          contentContainerStyle={[
            styles.listContent,
            { paddingHorizontal: horizontalPadding },
          ]}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          extraData={`${activeIndex}:${centeredScrollIndex}`}
          initialScrollIndex={HERO_CAROUSEL_LOOP_HEAD_INDEX}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true, listener: handleScroll },
          )}
          scrollEventThrottle={SCROLL_EVENT_THROTTLE_MS}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={handleScrollSettled}
          initialNumToRender={Math.min(loopedItems.length, HERO_CAROUSEL_RENDER_WINDOW)}
          maxToRenderPerBatch={HERO_CAROUSEL_RENDER_WINDOW}
          windowSize={HERO_CAROUSEL_RENDER_WINDOW}
          removeClippedSubviews={false}
          accessibilityRole="adjustable"
          accessibilityLabel={t('home.slideOf', { current: activeIndex + 1, total: items.length })}
          accessibilityHint={t('home.featuredCarousel')}
        />
      </View>
      <View style={styles.footer}>
        <HomeHeroMetadata
          contentType={activeItem.contentType}
          releaseDate={activeItem.releaseDate}
          voteAverage={activeItem.voteAverage}
        />
        <HomeHeroPaginationDots count={items.length} activeIndex={activeIndex} />
      </View>
    </View>
  );
}, areHomeHeroCarouselPropsEqual);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
    paddingTop: HOME_HERO_SEARCH_BREATHING_ROOM,
  },
  singleItemShell: {
    paddingHorizontal: spacing.md,
    paddingTop: HOME_HERO_SEARCH_BREATHING_ROOM,
  },
  carouselStage: {
    width: '100%',
    overflow: 'visible',
  },
  carouselList: {
    overflow: 'visible',
  },
  listContent: {
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: 6,
  },
});
