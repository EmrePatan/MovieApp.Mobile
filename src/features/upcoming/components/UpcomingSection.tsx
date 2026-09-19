import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { catalogItemKeyExtractor } from '@/features/catalog/utils/catalog-list-keys';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import type { UpcomingCatalogItem } from '../types';
import { UpcomingCard } from './UpcomingCard';
import { useUpcomingCatalog } from '../hooks/useUpcomingCatalog';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface UpcomingSectionProps {
  onItemPress?: (item: UpcomingCatalogItem) => void;
}

export function UpcomingSection({ onItemPress }: UpcomingSectionProps) {
  const { t } = useTranslation();
  const upcomingQuery = useUpcomingCatalog('followed');
  const items = upcomingQuery.data?.pages[0]?.items ?? [];
  const renderItem = useCallback(
    ({ item }: { item: UpcomingCatalogItem }) => (
      <UpcomingCard item={item} onPress={onItemPress} />
    ),
    [onItemPress],
  );

  if (upcomingQuery.isLoading) {
    return (
      <View style={styles.container}>
        <HomeSectionHeader title={t('upcoming.tabs.upcoming')} />
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </View>
    );
  }

  if (upcomingQuery.isError || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <HomeSectionHeader title={t('upcoming.tabs.upcoming')} />
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
