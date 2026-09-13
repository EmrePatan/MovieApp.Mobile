import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useDeleteRating, useRateContent } from '../hooks/useRatingMutations';
import { useMyRating, useRatingAggregate } from '../hooks/useRatings';
import type { RatingContentType } from '../types';
import { StarRatingSelector } from './StarRatingSelector';
import {
  backendScoreToStarRating,
  formatCommunityRatingAccessibilityLabel,
  formatCommunityRatingCountLabel,
  formatCommunityStarRatingDisplay,
  starRatingToBackendScore,
} from '../utils/star-rating';
import { useDetailScrollLock } from '@/features/details/shared/context/DetailScrollLockContext';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface DetailInlineRatingSectionProps {
  contentType: RatingContentType;
  contentId: string;
}

export function DetailInlineRatingSection({
  contentType,
  contentId,
}: DetailInlineRatingSectionProps) {
  const { requireAuth } = useRequireAuth();
  const scrollLock = useDetailScrollLock();
  const myRatingQuery = useMyRating(contentType, contentId);
  const aggregateQuery = useRatingAggregate(contentType, contentId);
  const rateContent = useRateContent(contentType, contentId);
  const deleteRating = useDeleteRating(contentType, contentId);
  const [optimisticScore, setOptimisticScore] = useState<number | null | undefined>(undefined);
  const [feedback, setFeedback] = useState<string | null>(null);

  const serverScore = myRatingQuery.data?.score ?? null;
  const displayScore =
    optimisticScore !== undefined ? optimisticScore : serverScore;
  const displayStarRating =
    displayScore != null ? backendScoreToStarRating(displayScore) : null;
  const isPending = rateContent.isPending || deleteRating.isPending;

  const communityMeta = useMemo(() => {
    const aggregate = aggregateQuery.data;
    if (!aggregate || aggregate.ratingCount <= 0) {
      return null;
    }

    return {
      stars: formatCommunityStarRatingDisplay(aggregate.averageScore),
      countLabel: formatCommunityRatingCountLabel(aggregate.ratingCount),
      accessibilityLabel: formatCommunityRatingAccessibilityLabel(
        aggregate.averageScore,
        aggregate.ratingCount,
      ),
    };
  }, [aggregateQuery.data]);

  const handleRate = (starRating: number) => {
    if (isPending) {
      return;
    }

    const backendScore = starRatingToBackendScore(starRating);
    const previousScore = serverScore;

    setOptimisticScore(backendScore);
    setFeedback(null);

    rateContent.mutate(backendScore, {
      onError: () => {
        setOptimisticScore(previousScore);
        setFeedback('Unable to save rating. Please try again.');
      },
      onSettled: () => {
        setOptimisticScore(undefined);
      },
    });
  };

  const handleClear = () => {
    if (!requireAuth() || isPending || serverScore == null) {
      return;
    }

    const previousScore = serverScore;

    setOptimisticScore(null);
    setFeedback(null);

    deleteRating.mutate(undefined, {
      onError: () => {
        setOptimisticScore(previousScore);
        setFeedback('Unable to remove rating. Please try again.');
      },
      onSettled: () => {
        setOptimisticScore(undefined);
      },
    });
  };

  return (
    <View style={styles.section} testID="detail-inline-rating-section">
      <AppText variant="subtitle" style={styles.title}>
        Your Rating
      </AppText>

      <View style={styles.ratingRow} testID="star-rating-row">
        <StarRatingSelector
          value={displayStarRating}
          disabled={isPending}
          onGestureStart={() => requireAuth()}
          onInteractionActiveChange={(active) => scrollLock?.setScrollLocked(active)}
          onCommit={handleRate}
          onClear={handleClear}
        />
      </View>

      {communityMeta ? (
        <View
          style={styles.communityRow}
          accessibilityRole="text"
          accessibilityLabel={communityMeta.accessibilityLabel}
          testID="community-rating-row"
        >
          <AppText variant="caption" style={styles.communityPrefix}>
            Community
          </AppText>
          <AppText variant="caption" style={styles.communityValue}>
            ★ {communityMeta.stars} / 5
          </AppText>
          <AppText variant="caption" style={styles.communitySeparator}>
            ·
          </AppText>
          <AppText variant="caption" style={styles.communityValue}>
            {communityMeta.countLabel}
          </AppText>
        </View>
      ) : null}

      <FeedbackMessage
        message={feedback}
        tone="error"
        onDismiss={() => setFeedback(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  title: {
    marginBottom: 0,
  },
  ratingRow: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  communityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  communityPrefix: {
    color: colors.textMuted,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  communityValue: {
    color: colors.textSecondary,
  },
  communitySeparator: {
    color: colors.textMuted,
  },
});
