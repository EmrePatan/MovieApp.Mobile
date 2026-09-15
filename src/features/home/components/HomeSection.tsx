import { memo, useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { HomeItem, HomeSection as HomeSectionModel } from '../types';
import { HomeSectionHeader } from './HomeSectionHeader';
import { HomeContentCard } from './HomeContentCard';
import { homeItemKeyExtractor } from '../utils/home-list-keys';
import { getHomeRailItemLayout } from '../utils/home-list-layout';
import { getHomeSectionVariant } from '../utils/home-section-variant';
import { layout } from '@/theme/layout';

interface HomeSectionProps {
  section: HomeSectionModel;
  onItemPress?: (item: HomeItem) => void;
  onSeeAllPress?: () => void;
}

function areHomeSectionPropsEqual(
  previous: HomeSectionProps,
  next: HomeSectionProps,
): boolean {
  return (
    previous.onItemPress === next.onItemPress &&
    previous.onSeeAllPress === next.onSeeAllPress &&
    previous.section.type === next.section.type &&
    previous.section.displayOrder === next.section.displayOrder &&
    previous.section.title === next.section.title &&
    previous.section.items === next.section.items
  );
}

export const HomeSection = memo(function HomeSection({
  section,
  onItemPress,
  onSeeAllPress,
}: HomeSectionProps) {
  const variant = getHomeSectionVariant(section.type);

  const renderItem = useCallback(
    ({ item }: { item: HomeItem }) => (
      <HomeContentCard item={item} onPress={onItemPress} />
    ),
    [onItemPress],
  );

  const listContentStyle = useMemo(
    () => [styles.listContent, variant === 'continueWatching' && styles.listContentContinue],
    [variant],
  );

  if (section.items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <HomeSectionHeader title={section.title} onSeeAllPress={onSeeAllPress} />
      <FlatList
        horizontal
        data={section.items}
        keyExtractor={homeItemKeyExtractor}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={listContentStyle}
        initialNumToRender={layout.horizontalList.initialNumToRender}
        maxToRenderPerBatch={layout.horizontalList.maxToRenderPerBatch}
        windowSize={layout.horizontalList.windowSize}
        getItemLayout={getHomeRailItemLayout}
        nestedScrollEnabled
      />
    </View>
  );
}, areHomeSectionPropsEqual);

const styles = StyleSheet.create({
  container: {
    marginBottom: layout.sectionGap,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  listContentContinue: {
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
});
