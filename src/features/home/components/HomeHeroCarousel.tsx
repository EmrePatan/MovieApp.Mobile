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
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [filterKey, heroItemsKey]);

  useEffect(() => {
    clearAutoAdvanceTimer();

    if (items.length <= 1 || isInteracting || !isAppActive || !isScreenFocused) {
      return clearAutoAdvanceTimer;
    }

    autoAdvanceTimerRef.current = setTimeout(() => {
      const nextIndex = (activeIndex + 1) % items.length;
      setActiveIndex(nextIndex);
      listRef.current?.scrollToOffset({
        offset: nextIndex * width,
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

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      setActiveIndex(Math.min(Math.max(nextIndex, 0), items.length - 1));
      setIsInteracting(false);
    },
    [items.length, width],
  );

  const handleScrollBeginDrag = useCallback(() => {
    setIsInteracting(true);
    clearAutoAdvanceTimer();
  }, [clearAutoAdvanceTimer]);

  const getItemLayout = useCallback(
    (_: ArrayLike<HomeItem> | null | undefined, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width],
  );

  const keyExtractor = useCallback(
    (item: HomeItem) => createHomeContentKey(item),
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
        data={items}
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
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        initialNumToRender={Math.min(items.length, 3)}
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
