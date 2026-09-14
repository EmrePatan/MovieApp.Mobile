import { memo } from 'react';
import { HomeHeroCarousel } from './HomeHeroCarousel';
import type { HomeItem, HomeTypeFilter } from '../types';

interface HomeListHeaderProps {
  heroItems: HomeItem[];
  filterKey: HomeTypeFilter;
  onItemPress: (item: HomeItem) => void;
  isScreenFocused?: boolean;
}

function areHomeListHeaderPropsEqual(
  previous: HomeListHeaderProps,
  next: HomeListHeaderProps,
): boolean {
  if (
    previous.filterKey !== next.filterKey ||
    previous.onItemPress !== next.onItemPress ||
    previous.isScreenFocused !== next.isScreenFocused ||
    previous.heroItems.length !== next.heroItems.length
  ) {
    return false;
  }

  return previous.heroItems.every(
    (item, index) =>
      item.id === next.heroItems[index]?.id &&
      item.contentType === next.heroItems[index]?.contentType,
  );
}

export const HomeListHeader = memo(function HomeListHeader({
  heroItems,
  filterKey,
  onItemPress,
  isScreenFocused = true,
}: HomeListHeaderProps) {
  if (heroItems.length === 0) {
    return null;
  }

  return (
    <HomeHeroCarousel
      items={heroItems}
      filterKey={filterKey}
      onItemPress={onItemPress}
      isScreenFocused={isScreenFocused}
    />
  );
}, areHomeListHeaderPropsEqual);
