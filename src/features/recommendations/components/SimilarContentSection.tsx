import { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { buildCatalogDetailRoute } from '@/features/details/shared/routes';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import { RecommendationCard } from './RecommendationCard';
import { useSimilarMovies } from '../hooks/useSimilarMovies';
import { useSimilarTvShows } from '../hooks/useSimilarTvShows';
import type { RecommendationItem } from '../types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface SimilarContentSectionProps {
  contentType: 'movie' | 'tv';
  contentId: string;
  title?: string;
}

export function SimilarContentSection({
  contentType,
  contentId,
  title = 'You May Also Like',
}: SimilarContentSectionProps) {
  const router = useRouter();
  const movieQuery = useSimilarMovies(contentType === 'movie' ? contentId : '');
  const tvQuery = useSimilarTvShows(contentType === 'tv' ? contentId : '');
  const query = contentType === 'movie' ? movieQuery : tvQuery;

  const handleItemPress = useCallback(
    (item: RecommendationItem) => {
      router.push(buildCatalogDetailRoute(item.id, item.type));
    },
    [router],
  );

  if (query.isLoading) {
    return (
      <View style={styles.container}>
        <HomeSectionHeader title={title} />
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </View>
    );
  }

  if (query.isError) {
    return (
      <View style={styles.container}>
        <HomeSectionHeader title={title} />
        <ErrorView
          message={
            isApiError(query.error)
              ? query.error.userMessage
              : 'Unable to load similar titles. Please try again.'
          }
          onRetry={() => void query.refetch()}
          retryLabel="Try Again"
        />
      </View>
    );
  }

  if (!query.data || query.data.items.length === 0) {
    return (
      <View style={styles.container}>
        <HomeSectionHeader title={title} />
        <AppText variant="bodySmall" muted style={styles.empty}>
          No similar titles available right now.
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HomeSectionHeader title={title} />
      <FlatList
        horizontal
        data={query.data.items}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={({ item }) => <RecommendationCard item={item} onPress={handleItemPress} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={4}
        maxToRenderPerBatch={6}
        windowSize={5}
      />
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
  },
  loading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  empty: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
});
