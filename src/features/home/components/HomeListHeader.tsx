import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { HomeHeader } from './HomeHeader';
import { HomeHero } from './HomeHero';
import { HomeTypeFilterControl } from './HomeTypeFilterControl';
import type { HomeItem, HomeTypeFilter } from '../types';

interface HomeListHeaderProps {
  typeFilter: HomeTypeFilter;
  onTypeFilterChange: (value: HomeTypeFilter) => void;
  featuredItem: HomeItem | null;
  onItemPress: (item: HomeItem) => void;
}

function areHomeListHeaderPropsEqual(
  previous: HomeListHeaderProps,
  next: HomeListHeaderProps,
): boolean {
  return (
    previous.typeFilter === next.typeFilter &&
    previous.onTypeFilterChange === next.onTypeFilterChange &&
    previous.onItemPress === next.onItemPress &&
    previous.featuredItem?.id === next.featuredItem?.id &&
    previous.featuredItem?.contentType === next.featuredItem?.contentType
  );
}

export const HomeListHeader = memo(function HomeListHeader({
  typeFilter,
  onTypeFilterChange,
  featuredItem,
  onItemPress,
}: HomeListHeaderProps) {
  if (featuredItem) {
    return (
      <HomeHero
        item={featuredItem}
        typeFilter={typeFilter}
        onTypeFilterChange={onTypeFilterChange}
        onPress={onItemPress}
      />
    );
  }

  return (
    <View style={styles.fallbackHeader}>
      <HomeHeader />
      <HomeTypeFilterControl value={typeFilter} onChange={onTypeFilterChange} />
    </View>
  );
}, areHomeListHeaderPropsEqual);

const styles = StyleSheet.create({
  fallbackHeader: {
    flexGrow: 0,
  },
});
