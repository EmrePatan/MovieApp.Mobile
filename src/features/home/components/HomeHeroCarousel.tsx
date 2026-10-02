import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  AppState,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { HomeHero } from './HomeHero';
import { HomeHeroMetadata } from './HomeHeroMetadata';
import { HomeHeroPaginationDots } from './HomeHeroPaginationDots';
import type { HomeItem, HomeTypeFilter } from '../types';
import {
  getHeroCarouselActiveIndexFromOffset,
  getHeroCarouselImagePriority,
  getScrollIndexForActiveIndex,
  getScrollIndexFromOffset,
  HERO_CAROUSEL_LOOP_HEAD_INDEX,
  resolveHeroCarouselLoopSettledOffset,
  shouldMountHeroSlide,
} from '../utils/home-hero-carousel-index';
import { HOME_HERO_SEARCH_BREATHING_ROOM } from '../utils/home-hero-layout';
import { useHomeHeroCarouselLayout } from '../hooks/useHomeHeroCarouselLayout';
import { areHomeItemsVisuallyEqual } from '../utils/home-list-keys';
import { createHomeContentKey } from '../utils/selectHeroCandidates';
import { prefetchHomeHeroNeighbors } from '../utils/prefetch-home-feed-images';
import { spacing } from '@/theme/spacing';

const AUTO_ADVANCE_MS = 4000;
const SCROLL_EVENT_THROTTLE_MS = 16;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

function scrollHeroCarouselTo(
  list: ScrollView | null,
  offset: number,
  animated: boolean,
) {
  list?.scrollTo({ x: offset, y: 0, animated });
}

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
  const listRef = useRef<ScrollView>(null);
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
    const isInitialMount = previousCarouselKeyRef.current == null;
    if (previousCarouselKeyRef.current === nextCarouselKey) {
      return;
    }

    previousCarouselKeyRef.current = nextCarouselKey;
    setActiveIndex(0);
    setCenteredScrollIndex(HERO_CAROUSEL_LOOP_HEAD_INDEX);
    setIsInteracting(false);
    const nextOffset = items.length > 1 ? snapInterval * HERO_CAROUSEL_LOOP_HEAD_INDEX : 0;
    scrollX.setValue(nextOffset);
    // contentOffset already shows the first slide. A mount-time scrollTo
    // cancels the leading cell's in-flight image before it can paint.
    if (isInitialMount) {
      return;
    }

    scrollHeroCarouselTo(listRef.current, nextOffset, false);
  }, [filterKey, heroItemsKey, items.length, scrollX, snapInterval]);

  useEffect(() => {
    clearAutoAdvanceTimer();

    if (items.length <= 1 || isInteracting || !isAppActive || !isScreenFocused) {
      return clearAutoAdvanceTimer;
    }

    autoAdvanceTimerRef.current = setTimeout(() => {
      const nextIndex = (activeIndex + 1) % items.length;
      scrollHeroCarouselTo(
        listRef.current,
        getScrollIndexForActiveIndex(nextIndex) * snapInterval,
        true,
      );
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
    prefetchHomeHeroNeighbors(items, activeIndex);
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
        scrollHeroCarouselTo(listRef.current, settledOffsetX, false);
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
        <AnimatedScrollView
          testID="home-hero-carousel-list"
          ref={listRef}
          style={styles.carouselList}
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
          contentOffset={{ x: initialScrollOffset, y: 0 }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true, listener: handleScroll },
          )}
          scrollEventThrottle={SCROLL_EVENT_THROTTLE_MS}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={handleScrollSettled}
          removeClippedSubviews={false}
          accessibilityRole="adjustable"
          accessibilityLabel={t('home.slideOf', { current: activeIndex + 1, total: items.length })}
          accessibilityHint={t('home.featuredCarousel')}
        >
          {loopedItems.map((item, index) => {
            const slideKey = `${index}:${createHomeContentKey(item)}`;
            const mountPoster = shouldMountHeroSlide(index, centeredScrollIndex);

            return (
              <View
                key={slideKey}
                testID={`hero-slot-${slideKey}`}
                style={[
                  styles.slideSlot,
                  { width: snapInterval, height: heroHeight },
                  index === centeredScrollIndex ? styles.slideSlotActive : null,
                ]}
              >
                {mountPoster ? (
                  <HomeHero
                    item={item}
                    heroHeight={heroHeight}
                    cardWidth={cardWidth}
                    embedded
                    isActive={index === centeredScrollIndex}
                    imagePriority={getHeroCarouselImagePriority(index, centeredScrollIndex)}
                    scrollX={scrollX}
                    slideIndex={index}
                    snapInterval={snapInterval}
                    onPress={onItemPress}
                    repaintPosterOnLayout={index === 0}
                  />
                ) : null}
              </View>
            );
          })}
        </AnimatedScrollView>
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
  slideSlot: {
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideSlotActive: {
    zIndex: 2,
    elevation: 6,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: 6,
  },
});
