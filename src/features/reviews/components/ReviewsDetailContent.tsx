import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DetailBackButton } from '@/features/details/shared/components/DetailBackButton';
import { isApiError } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useMyRating, useRatingAggregate } from '@/features/ratings/hooks/useRatings';
import { ReviewCard } from './ReviewCard';
import { ReviewComposer } from './ReviewComposer';
import { ReviewsPaginationControl } from './ReviewsPaginationControl';
import { ReviewsRatingDistribution } from './ReviewsRatingDistribution';
import { ReviewsSectionHeader } from './ReviewsSectionHeader';
import { ReviewsSortControl } from './ReviewsSortControl';
import { useMyReview } from '../hooks/useMyReview';
import {
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useUpdateReviewMutation,
} from '../hooks/useReviewMutations';
import { useReviewsQuery } from '../hooks/useReviewsQuery';
import type { ReviewContentType, ReviewResponse, ReviewSortOption } from '../types';
import { DEFAULT_REVIEW_SORT } from '../types';
import { buildStarBucketsFromDistribution } from '../utils/rating-star-buckets';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';

type ComposerMode = 'hidden' | 'create' | 'edit';

interface ReviewsDetailContentProps {
  contentType: ReviewContentType;
  contentId: string;
  contentTitle?: string;
}

function formatReviewCountLabel(totalCount: number): string {
  return `${totalCount} ${totalCount === 1 ? 'review' : 'reviews'}`;
}

function formatHeaderSubtitle(contentTitle?: string, totalCount?: number): string | null {
  const parts: string[] = [];

  if (contentTitle) {
    parts.push(contentTitle);
  }

  if (totalCount !== undefined) {
    parts.push(formatReviewCountLabel(totalCount));
  }

  return parts.length > 0 ? parts.join(' · ') : null;
}

export function ReviewsDetailContent({
  contentType,
  contentId,
  contentTitle,
}: ReviewsDetailContentProps) {
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ReviewSortOption>(DEFAULT_REVIEW_SORT);
  const [ratingStars, setRatingStars] = useState<number | null>(null);
  const reviewsQuery = useReviewsQuery(contentType, contentId, { page, sort, ratingStars });
  const ratingAggregateQuery = useRatingAggregate(contentType, contentId);
  const myReviewQuery = useMyReview(contentType, contentId);
  const myRatingQuery = useMyRating(contentType, contentId);
  const createReview = useCreateReviewMutation(contentType, contentId);
  const updateReview = useUpdateReviewMutation(contentType, contentId);
  const deleteReview = useDeleteReviewMutation(contentType, contentId);

  const [composerMode, setComposerMode] = useState<ComposerMode>('hidden');
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [authFeedback, setAuthFeedback] = useState<string | null>(null);

  const myReview = useMemo<ReviewResponse | null>(() => {
    const review = myReviewQuery.data;
    if (!review) {
      return null;
    }

    return {
      ...review,
      userRating: myRatingQuery.data?.score ?? review.userRating ?? null,
    };
  }, [myRatingQuery.data, myReviewQuery.data]);

  const totalCount = reviewsQuery.data?.totalCount ?? 0;
  const totalPages = reviewsQuery.data?.totalPages ?? 0;
  const ratingBuckets = useMemo(
    () => buildStarBucketsFromDistribution(ratingAggregateQuery.data?.scoreDistribution),
    [ratingAggregateQuery.data?.scoreDistribution],
  );

  const publicReviews = useMemo(() => {
    const items = reviewsQuery.data?.items ?? [];
    const seen = new Set<string>();

    return items.filter((review) => {
      if (seen.has(review.id)) {
        return false;
      }

      seen.add(review.id);

      if (myReview && review.id === myReview.id) {
        return false;
      }

      return true;
    });
  }, [myReview, reviewsQuery.data?.items]);

  const handleSortChange = useCallback((nextSort: ReviewSortOption) => {
    setSort(nextSort);
    setPage(1);
  }, []);

  const handleRatingStarsChange = useCallback((nextRatingStars: number | null) => {
    setRatingStars(nextRatingStars);
    setPage(1);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setPage((currentPage) => Math.max(1, currentPage - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage((currentPage) => Math.min(totalPages, currentPage + 1));
  }, [totalPages]);

  const handleWriteReview = useCallback(() => {
    if (!requireAuth()) {
      setAuthFeedback('Please sign in to write a review.');
      return;
    }

    setMutationError(null);
    setComposerMode('create');
  }, [requireAuth]);

  const handleEditReview = useCallback(() => {
    setMutationError(null);
    setComposerMode('edit');
  }, []);

  const handleCancelComposer = useCallback(() => {
    setComposerMode('hidden');
    setMutationError(null);
  }, []);

  const handleCreate = useCallback(
    (content: string) => {
      createReview.mutate(
        { content },
        {
          onSuccess: () => {
            setComposerMode('hidden');
            setMutationError(null);
          },
          onError: (error) => {
            setMutationError(
              isApiError(error)
                ? error.kind === 'conflict'
                  ? 'You already reviewed this title.'
                  : error.userMessage
                : 'Could not submit review. Please try again.',
            );
          },
        },
      );
    },
    [createReview],
  );

  const handleUpdate = useCallback(
    (content: string) => {
      updateReview.mutate(
        { content },
        {
          onSuccess: () => {
            setComposerMode('hidden');
            setMutationError(null);
          },
          onError: (error) => {
            setMutationError(
              isApiError(error)
                ? error.userMessage
                : 'Could not update review. Please try again.',
            );
          },
        },
      );
    },
    [updateReview],
  );

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete review',
      'Delete your review? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteReview.mutate(undefined, {
              onSuccess: () => {
                setComposerMode('hidden');
                setMutationError(null);
              },
              onError: (error) => {
                setMutationError(
                  isApiError(error)
                    ? error.userMessage
                    : 'Could not delete review. Please try again.',
                );
              },
            });
          },
        },
      ],
    );
  }, [deleteReview]);

  const isInitialLoading =
    (reviewsQuery.isLoading && !reviewsQuery.data) &&
    publicReviews.length === 0 &&
    !myReview;

  const headerSubtitle = formatHeaderSubtitle(
    contentTitle,
    !isInitialLoading && !reviewsQuery.isError ? totalCount : undefined,
  );

  const listHeader = (
    <View style={styles.listHeader}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <DetailBackButton contentInset={false} />
        <View style={styles.header}>
          <AppText variant="title" style={styles.headerTitle}>
            Reviews
          </AppText>
          {headerSubtitle ? (
            <AppText variant="bodySmall" muted numberOfLines={2} testID="reviews-total-count">
              {headerSubtitle}
            </AppText>
          ) : null}
        </View>
      </SafeAreaView>

      <FeedbackMessage
        message={authFeedback}
        tone="info"
        onDismiss={() => setAuthFeedback(null)}
      />

      {!myReview && composerMode !== 'create' ? (
        <ReviewsSectionHeader
          title="Your review"
          actionLabel="Write"
          onActionPress={handleWriteReview}
          testID="reviews-write-section"
        />
      ) : null}

      {composerMode === 'create' ? (
        <View testID="review-composer-anchor">
          <ReviewComposer
            submitLabel="Post review"
            isSubmitting={createReview.isPending}
            errorMessage={mutationError}
            autoFocus
            onSubmit={handleCreate}
            onCancel={handleCancelComposer}
          />
        </View>
      ) : null}

      {myReview && composerMode !== 'edit' ? (
        <View style={styles.myReviewSection}>
          <ReviewsSectionHeader title="Your review" />
          <ReviewCard
            review={myReview}
            isOwnReview
            variant="surface"
            isDeleting={deleteReview.isPending}
            onEdit={handleEditReview}
            onDelete={handleDelete}
          />
        </View>
      ) : null}

      {composerMode === 'edit' && myReview ? (
        <View testID="review-composer-anchor">
          <ReviewComposer
            initialContent={myReview.content}
            submitLabel="Save review"
            isSubmitting={updateReview.isPending}
            errorMessage={mutationError}
            autoFocus
            onSubmit={handleUpdate}
            onCancel={handleCancelComposer}
          />
        </View>
      ) : null}

      {!isInitialLoading && !reviewsQuery.isError ? (
        <View style={styles.communityPanel}>
          <ReviewsRatingDistribution
            buckets={ratingBuckets}
            selectedStars={ratingStars}
            onSelectStars={handleRatingStarsChange}
          />
          <ReviewsSortControl value={sort} onChange={handleSortChange} />
        </View>
      ) : null}
    </View>
  );

  const renderReviewItem = useCallback(
    ({ item }: { item: ReviewResponse }) => (
      <ReviewCard
        review={item}
        isOwnReview={Boolean(user && item.user.id === user.id)}
      />
    ),
    [user],
  );

  const listFooter = (
    <View style={styles.listFooter}>
      <ReviewsPaginationControl
        page={page}
        totalPages={totalPages}
        onPrevious={handlePreviousPage}
        onNext={handleNextPage}
      />
    </View>
  );

  const listEmpty =
    !isInitialLoading && !reviewsQuery.isError && publicReviews.length === 0 ? (
      <View style={styles.emptyState} accessibilityRole="text">
        <AppText variant="bodySmall" muted style={styles.emptyTitle}>
          {ratingStars !== null
            ? `No ${ratingStars}-star reviews yet.`
            : myReview
              ? 'No other reviews yet.'
              : 'No reviews yet.'}
        </AppText>
        {!myReview && ratingStars === null ? (
          <AppText variant="caption" muted>
            Be the first to share your thoughts.
          </AppText>
        ) : null}
      </View>
    ) : null;

  if (isInitialLoading) {
    return (
      <View style={styles.container} testID="reviews-detail-content">
        {listHeader}
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </View>
    );
  }

  if (reviewsQuery.isError && publicReviews.length === 0 && !myReview) {
    return (
      <View style={styles.container} testID="reviews-detail-content">
        {listHeader}
        <View style={styles.errorContainer}>
          <ErrorView
            message={
              isApiError(reviewsQuery.error)
                ? reviewsQuery.error.userMessage
                : 'Unable to load reviews. Please try again.'
            }
            onRetry={() => void reviewsQuery.refetch()}
            retryLabel="Try Again"
          />
        </View>
      </View>
    );
  }

  return (
    <FlatList
      testID="reviews-detail-content"
      style={styles.container}
      data={publicReviews}
      keyExtractor={(item) => item.id}
      renderItem={renderReviewItem}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={listEmpty}
      ListFooterComponent={listFooter}
      contentContainerStyle={styles.listContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      initialNumToRender={layout.verticalList.initialNumToRender}
      maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
      windowSize={layout.verticalList.windowSize}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSafeArea: {
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  headerTitle: {
    color: colors.textPrimary,
  },
  listContent: {
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  listHeader: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  myReviewSection: {
    gap: spacing.xs,
  },
  communityPanel: {
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  loading: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  listFooter: {
    gap: spacing.sm,
  },
});
