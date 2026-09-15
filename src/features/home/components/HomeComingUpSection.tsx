import { memo, useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { HomeItem, HomeSection as HomeSectionModel } from '../types';
import { HomeComingUpCard } from './HomeComingUpCard';
import { HomeSectionHeader } from './HomeSectionHeader';
import { homeItemKeyExtractor } from '../utils/home-list-keys';
import { getHomeRailItemLayout } from '../utils/home-list-layout';
import { layout } from '@/theme/layout';

interface HomeComingUpSectionProps {
  section: HomeSectionModel;
  onItemPress?: (item: HomeItem) => void;
  onSeeAllPress?: () => void;
}

export const HomeComingUpSection = memo(function HomeComingUpSection({
  section,
  onItemPress,
  onSeeAllPress,
}: HomeComingUpSectionProps) {
  const renderItem = useCallback(
    ({ item }: { item: HomeItem }) => (
      <HomeComingUpCard item={item} onPress={onItemPress} />
    ),
    [onItemPress],
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
        contentContainerStyle={styles.listContent}
        initialNumToRender={layout.horizontalList.initialNumToRender}
        maxToRenderPerBatch={layout.horizontalList.maxToRenderPerBatch}
        windowSize={layout.horizontalList.windowSize}
        getItemLayout={getHomeRailItemLayout}
        nestedScrollEnabled
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: layout.sectionGap,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
});
