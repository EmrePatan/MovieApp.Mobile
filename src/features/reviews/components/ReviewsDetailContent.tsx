import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { isApiError } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useMyRating, useRatingAggregate } from '@/features/ratings/hooks/useRatings';
import { ReviewCard } from './ReviewCard';
import { ReviewComposer } from './ReviewComposer';
import { ReviewsOwnReviewBar } from './ReviewsOwnReviewBar';
import { ReviewsPaginationControl } from './ReviewsPaginationControl';
import { ReviewsRatingDistribution } from './ReviewsRatingDistribution';
import { ReviewsFeedHeader } from './ReviewsFeedHeader';
import { ReviewsEmptyState } from './ReviewsEmptyState';
import { ReviewsScreenHeader } from './ReviewsScreenHeader';
import { ReviewsWriteFab } from './ReviewsWriteFab';
import { useMovieDetails } from '@/features/details/movie/hooks/useMovieDetails';
import { useTvShowDetails } from '@/features/details/tv/hooks/useTvShowDetails';
import { useMyReview } from '../hooks/useMyReview';
import {
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useUpdateReviewMutation,
} from '../hooks/useReviewMutations';
import { useReviewsQuery } from '../hooks/useReviewsQuery';
import type { ReviewContentType, ReviewResponse, ReviewSortOption } from '../types';
import { DEFAULT_REVIEW_SORT } from '../types';
import {
  buildStarBucketsFromDistribution,
  reviewMatchesStarFilter,
} from '../utils/rating-star-buckets';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

type ComposerMode = 'hidden' | 'create' | 'edit';

interface ReviewsDetailContentProps {
  contentType: ReviewContentType;
  contentId: string;
  contentTitle?: string;
}

export function ReviewsDetailContent({
  contentType,
  contentId,
  contentTitle,
}: ReviewsDetailContentProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const movieDetailsQuery = useMovieDetails(contentType === 'movie' ? contentId : undefined);
  const tvShowDetailsQuery = useTvShowDetails(contentType === 'tv' ? contentId : undefined);
  const posterPath =
    contentType === 'movie'
      ? movieDetailsQuery.data?.posterPath ?? null
      : tvShowDetailsQuery.data?.posterPath ?? null;
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
  const ratingAggregate = ratingAggregateQuery.data;
  const ownRatingScore = myReview?.userRating ?? myRatingQuery.data?.score ?? null;
  const ratingBuckets = useMemo(
    () => buildStarBucketsFromDistribution(ratingAggregate?.scoreDistribution),
    [ratingAggregate?.scoreDistribution],
  );
  const ownReviewMatchesRatingFilter = reviewMatchesStarFilter(ownRatingScore, ratingStars);

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

      if (user && review.user.id === user.id) {
        return false;
      }

      return true;
    });
  }, [myReview, reviewsQuery.data?.items, user]);

  const communityRatingCount = Math.max(
    0,
    (ratingAggregate?.ratingCount ?? 0) - (ownRatingScore != null ? 1 : 0),
  );
  const showCommunityControls = publicReviews.length > 0;
  const hasCommunityRatings = communityRatingCount > 0;
  const communityReviewCount = Math.max(0, totalCount - (myReview ? 1 : 0));

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
      setAuthFeedback(t('reviews.signInRequired'));
      return;
    }

    setMutationError(null);
    setComposerMode('create');
  }, [requireAuth, t]);

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
                  ? t('reviews.alreadyReviewed')
                  : error.userMessage
                : t('reviews.submitError'),
            );
          },
        },
      );
    },
    [createReview, t],
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
                : t('reviews.updateError'),
            );
          },
        },
      );
    },
    [updateReview, t],
  );

  const handleDelete = useCallback(() => {
    Alert.alert(
      t('common.deleteReviewTitle'),
      t('common.deleteReviewMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
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
                    : t('reviews.deleteError'),
                );
              },
            });
          },
        },
      ],
    );
  }, [deleteReview, t]);

  const isInitialLoading =
    (reviewsQuery.isLoading && !reviewsQuery.data) &&
    publicReviews.length === 0 &&
    !myReview;

  const showEmptyStateWithWriteAction =
    totalCount === 0 &&
    publicReviews.length === 0 &&
    ratingStars === null &&
    !myReview &&
    !isInitialLoading &&
    !reviewsQuery.isError;

  const showMeta = !isInitialLoading && !reviewsQuery.isError;

  const showWriteFab =
    composerMode === 'hidden' &&
    !showEmptyStateWithWriteAction &&
    !isInitialLoading &&
    !reviewsQuery.isError &&
    !myReview;

  const listHeader = (
    <View style={styles.listHeader}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <ReviewsScreenHeader
          contentTitle={contentTitle}
          reviewCount={showMeta ? totalCount : undefined}
          posterPath={posterPath}
          showMeta={showMeta}
        />
      </SafeAreaView>

      <FeedbackMessage
        message={authFeedback}
        tone="info"
        onDismiss={() => setAuthFeedback(null)}
      />

      {!isInitialLoading && !reviewsQuery.isError && showCommunityControls && hasCommunityRatings && ratingAggregate ? (
        <ReviewsRatingDistribution
          buckets={ratingBuckets}
          selectedStars={ratingStars}
          onSelectStars={handleRatingStarsChange}
          averageScore={ratingAggregate.averageScore}
          ratingCount={ratingAggregate.ratingCount}
        />
      ) : null}

      {myReview && composerMode !== 'edit' ? (
        <ReviewsOwnReviewBar review={myReview} onEdit={handleEditReview} />
      ) : null}

      {!isInitialLoading && !reviewsQuery.isError && showCommunityControls ? (
        <ReviewsFeedHeader
          reviewCount={communityReviewCount}
          sort={sort}
          selectedStars={ratingStars}
          onSortChange={handleSortChange}
          onClearFilter={() => handleRatingStarsChange(null)}
        />
      ) : null}

      {composerMode === 'create' ? (
        <View testID="review-composer-anchor">
          <ReviewComposer
            submitLabel={t('common.postReview')}
            isSubmitting={createReview.isPending}
            errorMessage={mutationError}
            autoFocus
            onSubmit={handleCreate}
            onCancel={handleCancelComposer}
          />
        </View>
      ) : null}

      {composerMode === 'edit' && myReview ? (
        <View style={styles.editComposerBlock} testID="review-composer-anchor">
          <ReviewComposer
            initialContent={myReview.content}
            submitLabel={t('common.saveReview')}
            isSubmitting={updateReview.isPending}
            errorMessage={mutationError}
            autoFocus
            onSubmit={handleUpdate}
            onCancel={handleCancelComposer}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.deleteReview')}
            disabled={deleteReview.isPending}
            onPress={handleDelete}
            style={({ pressed }) => [styles.deleteReviewButton, pressed && styles.pressed]}
          >
            <AppText variant="caption" style={styles.deleteReviewLabel}>
              {t('common.deleteReview')}
            </AppText>
          </Pressable>
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
      ratingStars !== null ? (
        <ReviewsEmptyState
          title={
            ownReviewMatchesRatingFilter
              ? t('reviews.empty.starFilterOwnMatch')
              : t('reviews.empty.starFilterEmpty', { stars: ratingStars })
          }
        />
      ) : myReview ? null : (
        <ReviewsEmptyState
          title={t('reviews.empty.title')}
          message={t('reviews.empty.message')}
          actionLabel={t('reviews.empty.writeFirst')}
          actionAccessibilityLabel={t('reviews.empty.writeFirstAccessibility')}
          onAction={handleWriteReview}
        />
      )
    ) : null;

  const writeFab = showWriteFab ? (
    <ReviewsWriteFab
      accessibilityLabel={
        myReview ? t('reviews.editReview') : t('reviews.writeAccessibility')
      }
      onPress={myReview ? handleEditReview : handleWriteReview}
      testID="reviews-write-section"
    />
  ) : null;

  if (isInitialLoading) {
    return (
      <View style={styles.container} testID="reviews-detail-content">
        {listHeader}
        <View style={styles.loading} testID="reviews-loading">
          <ActivityIndicator color={colors.accent} />
        </View>
        {writeFab ? (
          <View style={[styles.fabContainer, { bottom: spacing.lg + insets.bottom }]}>
            {writeFab}
          </View>
        ) : null}
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
                : t('reviews.loadError')
            }
            onRetry={() => void reviewsQuery.refetch()}
            retryLabel={t('common.retry')}
          />
        </View>
        {writeFab ? (
          <View style={[styles.fabContainer, { bottom: spacing.lg + insets.bottom }]}>
            {writeFab}
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        testID="reviews-detail-content"
        style={styles.container}
        data={publicReviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReviewItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        contentContainerStyle={[
          styles.listContent,
          showWriteFab && { paddingBottom: spacing.xxl + insets.bottom + 56 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        initialNumToRender={layout.verticalList.initialNumToRender}
        maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
        windowSize={layout.verticalList.windowSize}
      />
      {writeFab ? (
        <View style={[styles.fabContainer, { bottom: spacing.lg + insets.bottom }]}>
          {writeFab}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSafeArea: {
    backgroundColor: colors.background,
  },
  fabContainer: {
    position: 'absolute',
    right: 0,
    left: 0,
    pointerEvents: 'box-none',
  },
  listContent: {
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  listHeader: {
    gap: spacing.sm,
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
  listFooter: {
    gap: spacing.sm,
  },
  editComposerBlock: {
    gap: spacing.xs,
  },
  deleteReviewButton: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  deleteReviewLabel: {
    color: colors.danger,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.7,
  },
});

