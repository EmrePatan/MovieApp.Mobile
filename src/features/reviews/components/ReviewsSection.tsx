import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { isApiError } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { AppButton } from '@/components/buttons/AppButton';
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
import { spacing } from '@/theme/spacing';

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
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="subtitle">Reviews</AppText>
        {totalCount > 0 ? (
          <AppText variant="caption" muted>
            {totalCount} {totalCount === 1 ? 'review' : 'reviews'}
          </AppText>
        ) : null}
      </View>

      <FeedbackMessage
        message={authFeedback}
        tone="info"
        onDismiss={() => setAuthFeedback(null)}
      />

      {!myReview && composerMode !== 'create' ? (
        <AppButton title="Write a review" variant="secondary" onPress={handleWriteReview} />
      ) : null}

      {composerMode === 'create' ? (
        <ReviewComposer
          submitLabel="Post review"
          isSubmitting={createReview.isPending}
          errorMessage={mutationError}
          onSubmit={handleCreate}
          onCancel={handleCancelComposer}
        />
      ) : null}

      {myReview && composerMode !== 'edit' ? (
        <View style={styles.myReviewSection}>
          <AppText variant="bodySmall" muted>
            Your review
          </AppText>
          <ReviewCard review={myReview} isOwnReview />
          <View style={styles.myReviewActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit review"
              onPress={handleEditReview}
              style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}
            >
              <AppText variant="bodySmall">Edit</AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete review"
              disabled={deleteReview.isPending}
              onPress={handleDelete}
              style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}
            >
              <AppText variant="bodySmall" style={styles.destructive}>
                Delete
              </AppText>
            </Pressable>
          </View>
        </View>
      ) : null}

      {composerMode === 'edit' && myReview ? (
        <ReviewComposer
          initialContent={myReview.content}
          submitLabel="Save review"
          isSubmitting={updateReview.isPending}
          errorMessage={mutationError}
          onSubmit={handleUpdate}
          onCancel={handleCancelComposer}
        />
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
        <AppText variant="bodySmall" muted style={styles.empty}>
          Be the first to review this title.
        </AppText>
      ) : null}

      {publicReviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          isOwnReview={Boolean(user && review.user.id === user.id)}
        />
      ))}

      {reviewsQuery.hasNextPage ? (
        <AppButton
          title="Load more reviews"
          variant="ghost"
          loading={reviewsQuery.isFetchingNextPage}
          disabled={reviewsQuery.isFetchingNextPage}
          onPress={handleLoadMore}
        />
      ) : null}

      {reviewsQuery.isFetchingNextPage ? (
        <View style={styles.footerLoading}>
          <ActivityIndicator color={colors.accent} size="small" />
        </View>
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
    gap: spacing.xs,
  },
  myReviewSection: {
    gap: spacing.sm,
  },
  myReviewActions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  textAction: {
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
  destructive: {
    color: colors.error,
  },
  loading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  empty: {
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  footerLoading: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
