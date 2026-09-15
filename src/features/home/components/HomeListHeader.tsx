import { memo } from 'react';
import { HomeHeroCarousel } from './HomeHeroCarousel';
import { ColdHomeWelcome } from './ColdHomeWelcome';
import type { HomeItem } from '../types';

interface HomeListHeaderProps {
  heroItems: HomeItem[];
  showColdWelcome: boolean;
  onItemPress: (item: HomeItem) => void;
  onExplorePress: () => void;
  isScreenFocused?: boolean;
}

function areHomeListHeaderPropsEqual(
  previous: HomeListHeaderProps,
  next: HomeListHeaderProps,
): boolean {
  if (
    previous.showColdWelcome !== next.showColdWelcome ||
    previous.onItemPress !== next.onItemPress ||
    previous.onExplorePress !== next.onExplorePress ||
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
  showColdWelcome,
  onItemPress,
  onExplorePress,
  isScreenFocused = true,
}: HomeListHeaderProps) {
  if (showColdWelcome) {
    return <ColdHomeWelcome onExplorePress={onExplorePress} />;
  }

  if (heroItems.length === 0) {
    return null;
  }

  return (
    <HomeHeroCarousel
      items={heroItems}
      filterKey="all"
      onItemPress={onItemPress}
      isScreenFocused={isScreenFocused}
    />
  );
}, areHomeListHeaderPropsEqual);
