import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import type { HomeItem, HomeSection as HomeSectionModel } from '../types';
import { HomeComingUpCard } from './HomeComingUpCard';
import { HomeSectionHeader } from './HomeSectionHeader';
import { homeComingUpItemKeyExtractor } from '../utils/home-list-keys';
import { getHomeRailItemLayout } from '../utils/home-list-layout';
import { resolveHomeSectionTitle } from '../utils/resolve-home-section-title';
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
  const { t } = useTranslation();
  const localizedTitle = resolveHomeSectionTitle(section.type, section.title, t);

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
      <HomeSectionHeader title={localizedTitle} onSeeAllPress={onSeeAllPress} />
      <FlatList
        horizontal
        data={section.items}
        keyExtractor={homeComingUpItemKeyExtractor}
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
