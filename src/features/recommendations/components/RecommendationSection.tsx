import { FlatList, StyleSheet, View } from 'react-native';
import type { RecommendationSection as RecommendationSectionModel } from '../types';
import { RecommendationCard } from './RecommendationCard';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import { layout } from '@/theme/layout';

interface RecommendationSectionProps {
  section: RecommendationSectionModel;
  onItemPress?: (item: RecommendationSectionModel['items'][number]) => void;
}

export function RecommendationSection({ section, onItemPress }: RecommendationSectionProps) {
  if (section.items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <HomeSectionHeader title={section.title} />
      <FlatList
        horizontal
        data={section.items}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={({ item }) => <RecommendationCard item={item} onPress={onItemPress} />}
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
