import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import type { FollowingCatalogItem } from '../types';
import { FollowingCard } from './FollowingCard';
import { FollowingEmptyState } from './FollowingEmptyState';
import { useFollowingCatalog } from '../hooks/useFollowingCatalog';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface FollowingSectionProps {
  onItemPress?: (item: FollowingCatalogItem) => void;
}

export function FollowingSection({ onItemPress }: FollowingSectionProps) {
  const followingQuery = useFollowingCatalog();
  const items = followingQuery.data?.pages[0]?.items ?? [];

  if (followingQuery.isLoading) {
    return (
      <View style={styles.container}>
        <HomeSectionHeader title="Following" />
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </View>
    );
  }

  if (followingQuery.isError) {
    return null;
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <HomeSectionHeader title="Following" />
        <FollowingEmptyState />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HomeSectionHeader title="Following" />
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={({ item }) => <FollowingCard item={item} onPress={onItemPress} />}
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
  loading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
