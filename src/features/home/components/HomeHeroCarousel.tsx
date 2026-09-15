import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useQueryClient } from '@tanstack/react-query';
import { prefetchCatalogDetail } from '@/features/details/shared/navigation/prefetch-catalog-detail';
import { HomeHero } from './HomeHero';
import { useHeroFavoriteStatuses } from '../hooks/useHeroFavoriteStatuses';
import type { HomeItem, HomeTypeFilter } from '../types';
import { getHomeHeroHeight } from '../utils/home-hero-layout';
import { createHomeContentKey } from '../utils/selectHeroCandidates';
import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const AUTO_ADVANCE_MS = 6000;
const LOOP_HEAD_INDEX = 1;

function buildLoopedHeroItems(items: HomeItem[]): HomeItem[] {
  if (items.length <= 1) {
    return items;
  }

  return [items[items.length - 1], ...items, items[0]];
}

function getActiveIndexFromScrollIndex(scrollIndex: number, itemCount: number): number {
  if (scrollIndex <= 0) {
    return itemCount - 1;
  }

  if (scrollIndex >= itemCount + 1) {
    return 0;
  }

  return scrollIndex - LOOP_HEAD_INDEX;
}

function getScrollIndexForActiveIndex(activeIndex: number): number {
  return activeIndex + LOOP_HEAD_INDEX;
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

  return previous.items.every(
    (item, index) =>
      item.id === next.items[index]?.id &&
      item.contentType === next.items[index]?.contentType,
  );
}

export const HomeHeroCarousel = memo(function HomeHeroCarousel({
  items,
  filterKey,
  onItemPress,
  isScreenFocused = true,
}: HomeHeroCarouselProps) {
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const heroHeight = useMemo(() => getHomeHeroHeight(width), [width]);
  const listRef = useRef<FlatList<HomeItem>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isAppActive, setIsAppActive] = useState(AppState.currentState === 'active');
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousCarouselKeyRef = useRef<string | null>(null);
  const favoriteStatuses = useHeroFavoriteStatuses(items);
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
      offset: items.length > 1 ? width * LOOP_HEAD_INDEX : 0,
      animated: false,
    });
  }, [filterKey, heroItemsKey, items.length, width]);

  useEffect(() => {
    clearAutoAdvanceTimer();

    if (items.length <= 1 || isInteracting || !isAppActive || !isScreenFocused) {
      return clearAutoAdvanceTimer;
    }

    autoAdvanceTimerRef.current = setTimeout(() => {
      const nextIndex = (activeIndex + 1) % items.length;
      setActiveIndex(nextIndex);
      listRef.current?.scrollToOffset({
        offset: getScrollIndexForActiveIndex(nextIndex) * width,
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
    width,
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
    if (!isScreenFocused) {
      return;
    }

    const activeItem = items[activeIndex];
    if (!activeItem) {
      return;
    }

    prefetchCatalogDetail(
      queryClient,
      activeItem.id,
      activeItem.contentType === 'movie' ? 'movie' : 'tv',
    );
  }, [activeIndex, isScreenFocused, items, queryClient]);

  useEffect(() => {
    if (items.length <= 1) {
      return;
    }

    const nextItem = items[activeIndex + 1];
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

      const scrollIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      const nextActiveIndex = getActiveIndexFromScrollIndex(scrollIndex, items.length);
      setActiveIndex(nextActiveIndex);

      if (scrollIndex === 0) {
        listRef.current?.scrollToOffset({
          offset: items.length * width,
          animated: false,
        });
      } else if (scrollIndex === items.length + 1) {
        listRef.current?.scrollToOffset({
          offset: LOOP_HEAD_INDEX * width,
          animated: false,
        });
      }

      setIsInteracting(false);
    },
    [items.length, width],
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
      length: width,
      offset: width * index,
      index,
    }),
    [width],
  );

  const keyExtractor = useCallback(
    (item: HomeItem, index: number) => `${index}:${createHomeContentKey(item)}`,
    [],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<HomeItem>) => {
      const contentKey = createHomeContentKey(item);
      const favoriteStatus = favoriteStatuses.statuses[contentKey];

      return (
        <View style={[styles.slide, { width }]}>
          <HomeHero
            item={item}
            heroHeight={heroHeight}
            embedded
            onPress={onItemPress}
            favoriteIsFavorited={favoriteStatus?.isFavorited}
            favoriteStatusResolved={favoriteStatus?.resolved ?? false}
            favoriteStatusPending={favoriteStatuses.isLoading}
          />
        </View>
      );
    },
    [favoriteStatuses.isLoading, favoriteStatuses.statuses, heroHeight, onItemPress, width],
  );

  if (items.length === 0) {
    return null;
  }

  if (items.length === 1) {
    const contentKey = createHomeContentKey(items[0]);
    const favoriteStatus = favoriteStatuses.statuses[contentKey];

    return (
      <HomeHero
        item={items[0]}
        heroHeight={heroHeight}
        onPress={() => onItemPress(items[0])}
        favoriteIsFavorited={favoriteStatus?.isFavorited}
        favoriteStatusResolved={favoriteStatus?.resolved ?? false}
        favoriteStatusPending={favoriteStatuses.isLoading}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={loopedItems}
        horizontal
        pagingEnabled
        bounces={false}
        decelerationRate="fast"
        directionalLockEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        extraData={activeIndex}
        initialScrollIndex={LOOP_HEAD_INDEX}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleScrollSettled}
        initialNumToRender={Math.min(loopedItems.length, 3)}
        maxToRenderPerBatch={2}
        windowSize={3}
        accessibilityRole="adjustable"
        accessibilityLabel="Featured discovery carousel"
      />
      <View
        style={styles.indicatorRow}
        accessibilityRole="text"
        accessibilityLabel={`Slide ${activeIndex + 1} of ${items.length}`}
      >
        {items.map((item, index) => (
          <View
            key={createHomeContentKey(item)}
            testID={index === activeIndex ? 'hero-indicator-active' : 'hero-indicator-inactive'}
            style={[
              styles.indicatorDot,
              index === activeIndex ? styles.indicatorDotActive : styles.indicatorDotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}, areHomeHeroCarouselPropsEqual);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  slide: {
    overflow: 'hidden',
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  indicatorDot: {
    width: 18,
    height: 3,
    borderRadius: 2,
  },
  indicatorDotActive: {
    backgroundColor: colors.accent,
  },
  indicatorDotInactive: {
    backgroundColor: colors.borderSubtle,
  },
});
