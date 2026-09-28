import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import {
  MY_COMMENTS_REVIEWS_RETURN_HREF,
  openReviewsDetail,
} from '@/features/details/shared/navigation/reviews-detail-navigation';
import {
  buildMovieReviewsRoute,
  buildTvReviewsRoute,
} from '@/features/details/shared/routes';
import { MyCommentsMediaFilter } from './MyCommentsMediaFilter';
import type { CatalogMediaFilter } from '@/features/library/types';
import { shouldRequestNextInfinitePage } from '@/utils/should-request-next-infinite-page';
import { useMyComments } from '../hooks/useMyComments';
import type { UserReviewListItem } from '../types/my-comments';
import { MyCommentRow } from './MyCommentRow';
import { MyCommentsEmptyState } from './MyCommentsEmptyState';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { MY_COMMENTS_HORIZONTAL_INSET } from '../utils/my-comments-layout';

export function MyCommentsContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [mediaType, setMediaType] = useState<CatalogMediaFilter>('all');
  const commentsQuery = useMyComments(mediaType);

  const items = useMemo(
    () => commentsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [commentsQuery.data?.pages],
  );

  const handleOpenReviews = useCallback(
    (item: UserReviewListItem) => {
      const reviewsRoute =
        item.contentType === 'movie'
          ? buildMovieReviewsRoute(item.contentId, { title: item.title })
          : buildTvReviewsRoute(item.contentId, { title: item.title });

      openReviewsDetail(router, reviewsRoute, {
        returnHref: MY_COMMENTS_REVIEWS_RETURN_HREF,
      });
    },
    [router],
  );

  const handleDiscover = useCallback(() => {
    router.push('/(tabs)/(app-shell)/discover');
  }, [router]);

  const handleLoadMore = useCallback(() => {
    if (shouldRequestNextInfinitePage(commentsQuery)) {
      void commentsQuery.fetchNextPage();
    }
  }, [commentsQuery]);

  if (commentsQuery.isLoading && items.length === 0) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
        <AppText variant="bodySmall" muted>
          {t('common.loading')}
        </AppText>
      </View>
    );
  }

  if (commentsQuery.isError && items.length === 0) {
    const message = isApiError(commentsQuery.error)
      ? commentsQuery.error.userMessage
      : t('common.somethingWentWrong');

    return (
      <View style={styles.error}>
        <ErrorView message={message} onRetry={() => void commentsQuery.refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MyCommentRow item={item} onPress={handleOpenReviews} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={[
        styles.listContent,
        items.length === 0 && styles.listContentEmpty,
      ]}
      ListHeaderComponent={
        <View style={styles.filters}>
          <MyCommentsMediaFilter value={mediaType} onChange={setMediaType} />
        </View>
      }
      ListEmptyComponent={<MyCommentsEmptyState onDiscover={handleDiscover} />}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        commentsQuery.isFetchingNextPage ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator color={colors.accent} size="small" />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  filters: {
    paddingBottom: spacing.lg,
  },
  separator: {
    height: spacing.sm,
  },
  listContent: {
    paddingHorizontal: MY_COMMENTS_HORIZONTAL_INSET,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  error: {
    flex: 1,
    padding: spacing.lg,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
