import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { ErrorView } from '@/components/common/ErrorView';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import { RecommendationCard } from '@/features/recommendations/components/RecommendationCard';
import type { RecommendationItem } from '@/features/recommendations/types';
import { openCatalogDetailFromDetail } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { useCollectionDetail } from '../hooks/useCollectionDetail';
import type { CollectionSummary } from '../types';
import {
  mapCollectionPartToRecommendationItem,
  sortCollectionParts,
} from '../utils/collection-part-items';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface CollectionPartsSectionProps {
  collection: CollectionSummary | null;
}

export function CollectionPartsSection({ collection }: CollectionPartsSectionProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const query = useCollectionDetail(collection?.tmdbId);

  const items = useMemo((): RecommendationItem[] => {
    if (!query.data?.parts.length) {
      return [];
    }

    return sortCollectionParts(query.data.parts).map(mapCollectionPartToRecommendationItem);
  }, [query.data?.parts]);

  const handleItemPress = useCallback(
    (item: RecommendationItem) => {
      openCatalogDetailFromDetail(router, item.id, item.type);
    },
    [router],
  );

  const sectionTitle = t('details.sections.allMoviesInSeries');

  if (!collection) {
    return null;
  }

  if (query.isLoading) {
    return (
      <View style={styles.container}>
        <HomeSectionHeader title={sectionTitle} />
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </View>
    );
  }

  if (query.isError) {
    return (
      <View style={styles.container}>
        <HomeSectionHeader title={sectionTitle} />
        <ErrorView
          message={
            isApiError(query.error)
              ? query.error.userMessage
              : t('details.collection.loadError')
          }
          onRetry={() => void query.refetch()}
        />
      </View>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} testID="collection-parts-section">
      <HomeSectionHeader title={sectionTitle} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {items.map((item) => (
          <RecommendationCard key={item.id} item={item} onPress={handleItemPress} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  loading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
