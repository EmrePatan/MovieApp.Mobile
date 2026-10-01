import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveTabBarLayoutMetrics } from '@/features/navigation/tab-bar-layout-metrics';
import { layout } from '@/theme/layout';
import {
  getHomeHeroCarouselHorizontalPadding,
  getHomeHeroSnapInterval,
  resolveHomeHeroPosterDimensions,
} from '../utils/home-hero-layout';
import { useHomeHeaderLayout } from './useHomeHeaderLayout';

export function useHomeHeroCarouselLayout(includePaginationDots: boolean) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const headerLayout = useHomeHeaderLayout();
  const tabBarMetrics = useMemo(() => resolveTabBarLayoutMetrics(insets), [insets]);

  return useMemo(() => {
    const { posterWidth, posterHeight } = resolveHomeHeroPosterDimensions({
      windowWidth: width,
      windowHeight: height,
      safeAreaTop: insets.top,
      tabBarTotalHeight: tabBarMetrics.totalHeight,
      heroOffsetCompensation: headerLayout.heroOffsetCompensation,
      peekSectionRowHeight: layout.homeSection.rowHeight,
      includePaginationDots,
    });
    const snapInterval = getHomeHeroSnapInterval(width, posterWidth);
    const horizontalPadding = getHomeHeroCarouselHorizontalPadding(width, snapInterval);

    return {
      heroHeight: posterHeight,
      cardWidth: posterWidth,
      snapInterval,
      horizontalPadding,
    };
  }, [
    width,
    height,
    insets.top,
    tabBarMetrics.totalHeight,
    headerLayout.heroOffsetCompensation,
    includePaginationDots,
  ]);
}
