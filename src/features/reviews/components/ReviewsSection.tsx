import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDetailScroll } from '@/features/details/shared/context/DetailScrollContext';
import { isApiError } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { ReviewCard } from './ReviewCard';
import { ReviewComposer } from './ReviewComposer';
import { useMyReview } from '../hooks/useMyReview';
import {
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useUpdateReviewMutation,
} from '../hooks/useReviewMutations';
import { useMovieReviews } from '../hooks/useMovieReviews';
import { useTvShowReviews } from '../hooks/useTvShowReviews';
import type { ReviewContentType } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

type ComposerMode = 'hidden' | 'create' | 'edit';

interface ReviewsSectionProps {
  contentType: ReviewContentType;
  contentId: string;
}

function useReviewsQuery(contentType: ReviewContentType, contentId: string) {
  const movieQuery = useMovieReviews(contentType === 'movie' ? contentId : '');
  const tvQuery = useTvShowReviews(contentType === 'tv' ? contentId : '');
  return contentType === 'movie' ? movieQuery : tvQuery;
}

export function ReviewsSection({ contentType, contentId }: ReviewsSectionProps) {
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const detailScroll = useDetailScroll();
  const composerRef = useRef<View>(null);
  const reviewsQuery = useReviewsQuery(contentType, contentId);
  const myReviewQuery = useMyReview(contentType, contentId);
  const createReview = useCreateReviewMutation(contentType, contentId);
  const updateReview = useUpdateReviewMutation(contentType, contentId);
  const deleteReview = useDeleteReviewMutation(contentType, contentId);

  const [composerMode, setComposerMode] = useState<ComposerMode>('hidden');
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [authFeedback, setAuthFeedback] = useState<string | null>(null);

  const myReview = myReviewQuery.data ?? null;
  const totalCount = reviewsQuery.data?.pages[0]?.totalCount ?? 0;

  const publicReviews = useMemo(() => {
    const items = reviewsQuery.data?.pages.flatMap((page) => page.items) ?? [];
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
  }, [myReview, reviewsQuery.data?.pages]);

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

  useEffect(() => {
    if (composerMode === 'hidden') {
      return;
    }

    const scrollTimer = setTimeout(() => {
      detailScroll?.scrollToCenter(composerRef);
    }, 0);

    return () => {
      clearTimeout(scrollTimer);
    };
  }, [composerMode, detailScroll]);

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

  const handleLoadMore = useCallback(() => {
    if (
      !reviewsQuery.hasNextPage ||
      reviewsQuery.isFetchingNextPage ||
      reviewsQuery.isFetching
    ) {
      return;
    }

    void reviewsQuery.fetchNextPage();
  }, [reviewsQuery]);

  const isInitialLoading = reviewsQuery.isLoading && publicReviews.length === 0 && !myReview;

  return (
    <View style={styles.container} testID="reviews-section">
      <View style={styles.header}>
        <AppText variant="subtitle" style={styles.sectionTitle}>Reviews</AppText>
        {totalCount > 0 ? (
          <View
            style={styles.countBadge}
            accessibilityLabel={`${totalCount} ${totalCount === 1 ? 'review' : 'reviews'}`}
          >
            <AppText variant="caption" style={styles.countText}>
              {totalCount}
            </AppText>
          </View>
        ) : null}
      </View>

      <FeedbackMessage
        message={authFeedback}
        tone="info"
        onDismiss={() => setAuthFeedback(null)}
      />

      {!myReview && composerMode !== 'create' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Write a review"
          onPress={handleWriteReview}
          style={({ pressed }) => [styles.writeCta, pressed && styles.pressed]}
        >
          <View style={styles.writeCtaIcon}>
            <Ionicons name="create-outline" size={18} color={colors.accent} />
          </View>
          <AppText variant="bodySmall" style={styles.writeCtaText}>
            Write a review
          </AppText>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>
      ) : null}

      {composerMode === 'create' ? (
        <View ref={composerRef} collapsable={false} testID="review-composer-anchor">
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
          <View style={styles.myReviewLabelRow}>
            <Ionicons name="person-circle-outline" size={16} color={colors.textMuted} />
            <AppText variant="caption" style={styles.myReviewLabel}>
              Your review
            </AppText>
          </View>
          <View style={styles.myReviewCard}>
            <ReviewCard
              review={myReview}
              isOwnReview
              variant="elevated"
              isDeleting={deleteReview.isPending}
              onEdit={handleEditReview}
              onDelete={handleDelete}
            />
          </View>
        </View>
      ) : null}

      {composerMode === 'edit' && myReview ? (
        <View ref={composerRef} collapsable={false} testID="review-composer-anchor">
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

      {isInitialLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : null}

      {reviewsQuery.isError && publicReviews.length === 0 && !myReview ? (
        <ErrorView
          message={
            isApiError(reviewsQuery.error)
              ? reviewsQuery.error.userMessage
              : 'Unable to load reviews. Please try again.'
          }
          onRetry={() => void reviewsQuery.refetch()}
          retryLabel="Try Again"
        />
      ) : null}

      {!isInitialLoading && !reviewsQuery.isError && publicReviews.length === 0 && !myReview ? (
        <View style={styles.emptyState} accessibilityRole="text">
          <View style={styles.emptyIcon}>
            <Ionicons name="chatbubbles-outline" size={22} color={colors.textMuted} />
          </View>
          <AppText variant="bodySmall" style={styles.emptyTitle}>
            No reviews yet
          </AppText>
          <AppText variant="caption" muted>
            Be the first to share your thoughts.
          </AppText>
        </View>
      ) : null}

      {publicReviews.length > 0 ? (
        <View style={styles.reviewList}>
          {publicReviews.map((review, index) => (
            <View key={review.id}>
              <ReviewCard
                review={review}
                isOwnReview={Boolean(user && review.user.id === user.id)}
              />
              {index < publicReviews.length - 1 ? <View style={styles.reviewDivider} /> : null}
            </View>
          ))}
        </View>
      ) : null}

      {reviewsQuery.hasNextPage ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Load more reviews"
          accessibilityState={{ disabled: reviewsQuery.isFetchingNextPage }}
          disabled={reviewsQuery.isFetchingNextPage}
          onPress={handleLoadMore}
          style={({ pressed }) => [styles.loadMore, pressed && styles.pressed]}
        >
          {reviewsQuery.isFetchingNextPage ? (
            <ActivityIndicator color={colors.accent} size="small" />
          ) : (
            <>
              <AppText variant="caption" style={styles.loadMoreText}>
                Load more reviews
              </AppText>
              <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
            </>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    marginBottom: 0,
  },
  countBadge: {
    minWidth: 28,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  countText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  writeCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    minHeight: interaction.touchTarget,
  },
  writeCtaIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentTint12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  writeCtaText: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  myReviewSection: {
    gap: spacing.sm,
  },
  myReviewLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  myReviewLabel: {
    color: colors.textMuted,
    fontWeight: '500',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  myReviewCard: {
    backgroundColor: colors.accentTint12,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accentTint18,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  loading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  reviewList: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  reviewDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  loadMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: interaction.touchTarget,
    paddingVertical: spacing.xs,
  },
  loadMoreText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
