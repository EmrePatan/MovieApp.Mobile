import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { openCatalogDetailFromDetail } from '@/features/details/shared/navigation/catalog-detail-navigation';
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
  title,
}: SimilarContentSectionProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('details.sections.similar');
  const router = useRouter();
  const movieQuery = useSimilarMovies(contentType === 'movie' ? contentId : '');
  const tvQuery = useSimilarTvShows(contentType === 'tv' ? contentId : '');
  const query = contentType === 'movie' ? movieQuery : tvQuery;

  const handleItemPress = useCallback(
    (item: RecommendationItem) => {
      openCatalogDetailFromDetail(router, item.id, item.type);
    },
    [router],
  );

  if (query.isLoading) {
    return (
      <View style={styles.container}>
        <HomeSectionHeader title={resolvedTitle} />
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </View>
    );
  }

  if (query.isError) {
    return (
      <View style={styles.container}>
        <HomeSectionHeader title={resolvedTitle} />
        <ErrorView
          message={
            isApiError(query.error)
              ? query.error.userMessage
              : t('details.similar.loadError')
          }
          onRetry={() => void query.refetch()}
        />
      </View>
    );
  }

  if (!query.data || query.data.items.length === 0) {
    return (
      <View style={styles.container}>
        <HomeSectionHeader title={resolvedTitle} />
        <AppText variant="bodySmall" muted style={styles.empty}>
          {t('details.similar.empty')}
        </AppText>
      </View>
    );
  }

  const items = query.data.items;

  return (
    <View style={styles.container}>
      <HomeSectionHeader title={resolvedTitle} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {items.map((item) => (
          <RecommendationCard
            key={`${item.type}-${item.id}`}
            item={item}
            onPress={handleItemPress}
          />
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
  empty: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
});
