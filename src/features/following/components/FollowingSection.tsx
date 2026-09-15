import { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { catalogItemKeyExtractor } from '@/features/catalog/utils/catalog-list-keys';
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

  const renderItem = useCallback(
    ({ item }: { item: FollowingCatalogItem }) => (
      <FollowingCard item={item} onPress={onItemPress} />
    ),
    [onItemPress],
  );

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
        keyExtractor={catalogItemKeyExtractor}
        renderItem={renderItem}
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
