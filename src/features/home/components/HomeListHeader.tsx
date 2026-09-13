import { memo } from 'react';
import { HomeHero } from './HomeHero';
import type { HomeItem } from '../types';

interface HomeListHeaderProps {
  featuredItem: HomeItem | null;
  onItemPress: (item: HomeItem) => void;
}

function areHomeListHeaderPropsEqual(
  previous: HomeListHeaderProps,
  next: HomeListHeaderProps,
): boolean {
  return (
    previous.onItemPress === next.onItemPress &&
    previous.featuredItem?.id === next.featuredItem?.id &&
    previous.featuredItem?.contentType === next.featuredItem?.contentType
  );
}

export const HomeListHeader = memo(function HomeListHeader({
  featuredItem,
  onItemPress,
}: HomeListHeaderProps) {
  if (!featuredItem) {
    return null;
  }

  return <HomeHero item={featuredItem} onPress={onItemPress} />;
}, areHomeListHeaderPropsEqual);
