import { FlatList, StyleSheet, View } from 'react-native';
import type { HomeSection as HomeSectionModel } from '../types';
import { HomeSectionHeader } from './HomeSectionHeader';
import { HomeContentCard } from './HomeContentCard';
import { layout } from '@/theme/layout';

interface HomeSectionProps {
  section: HomeSectionModel;
  onItemPress?: (item: HomeSectionModel['items'][number]) => void;
}

export function HomeSection({ section, onItemPress }: HomeSectionProps) {
  if (section.items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <HomeSectionHeader title={section.title} />
      <FlatList
        horizontal
        data={section.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HomeContentCard item={item} onPress={onItemPress} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={layout.horizontalList.initialNumToRender}
        maxToRenderPerBatch={layout.horizontalList.maxToRenderPerBatch}
        windowSize={layout.horizontalList.windowSize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: layout.sectionGap,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
});
