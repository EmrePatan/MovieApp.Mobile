import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDetailScroll } from '@/features/details/shared/context/DetailScrollContext';
import { DetailBackButton } from '@/features/details/shared/components/DetailBackButton';
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
import { useReviewsQuery } from '../hooks/useReviewsQuery';
import type { ReviewContentType, ReviewResponse } from '../types';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

type ComposerMode = 'hidden' | 'create' | 'edit';

interface ReviewsDetailContentProps {
  contentType: ReviewContentType;
  contentId: string;
  contentTitle?: string;
}

function formatReviewsSubtitle(totalCount: number, contentTitle?: string): string {
  const countLabel = `${totalCount} ${totalCount === 1 ? 'review' : 'reviews'}`;

  if (!contentTitle) {
    return countLabel;
  }

  return `${contentTitle} · ${countLabel}`;
}

export function ReviewsDetailContent({
  contentType,
  contentId,
  contentTitle,
}: ReviewsDetailContentProps) {
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

  const listHeader = (
    <View style={styles.listHeader}>
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
    </View>
  );

  const renderReviewItem = useCallback(
    ({ item, index }: { item: ReviewResponse; index: number }) => (
      <View>
        <ReviewCard
          review={item}
          isOwnReview={Boolean(user && item.user.id === user.id)}
        />
        {index < publicReviews.length - 1 ? <View style={styles.reviewDivider} /> : null}
      </View>
    ),
    [publicReviews.length, user],
  );

  const listFooter = reviewsQuery.hasNextPage ? (
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
  ) : (
    <View style={styles.listFooterSpacer} />
  );

  const listEmpty =
    !isInitialLoading && !reviewsQuery.isError && publicReviews.length === 0 && !myReview ? (
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
    ) : null;

  return (
    <View style={styles.container} testID="reviews-detail-content">
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <DetailBackButton contentInset={false} />
        <View style={styles.header}>
          <AppText variant="title" style={styles.headerTitle}>
            Reviews
          </AppText>
          <AppText variant="bodySmall" muted numberOfLines={2}>
            {formatReviewsSubtitle(totalCount, contentTitle)}
          </AppText>
        </View>
      </SafeAreaView>

      {isInitialLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : null}

      {reviewsQuery.isError && publicReviews.length === 0 && !myReview ? (
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
      ) : (
        <FlatList
          testID="reviews-detail-list"
          data={isInitialLoading || reviewsQuery.isError ? [] : publicReviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReviewItem}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={listFooter}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          initialNumToRender={layout.verticalList.initialNumToRender}
          maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
          windowSize={layout.verticalList.windowSize}
        />
      )}
    </View>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  listHeader: {
    gap: spacing.md,
    paddingBottom: spacing.md,
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
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
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
    paddingVertical: spacing.md,
  },
  loadMoreText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  listFooterSpacer: {
    height: spacing.lg,
  },
});
