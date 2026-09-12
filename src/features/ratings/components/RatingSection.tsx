import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { isApiError } from '@/api/errors';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { formatRating, formatVoteCount } from '@/utils/format';
import { useDeleteRating, useRateContent } from '../hooks/useRatingMutations';
import { useMyRating, useRatingAggregate } from '../hooks/useRatings';
import type { RatingContentType } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

const RATING_SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

interface RatingSectionProps {
  contentType: RatingContentType;
  contentId: string;
}

export function RatingSection({ contentType, contentId }: RatingSectionProps) {
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const myRatingQuery = useMyRating(contentType, contentId);
  const aggregateQuery = useRatingAggregate(contentType, contentId);

  const rateContent = useRateContent(contentType, contentId);
  const deleteRating = useDeleteRating(contentType, contentId);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);

  const currentScore = myRatingQuery.data?.score ?? null;
  const activeScore = selectedScore ?? currentScore;
  const isMutating = rateContent.isPending || deleteRating.isPending;

  const aggregateLabel = useMemo(() => {
    if (aggregateQuery.isLoading) {
      return 'Loading community ratings...';
    }

    if (aggregateQuery.isError || !aggregateQuery.data) {
      return 'Community ratings unavailable.';
    }

    const { averageScore, ratingCount } = aggregateQuery.data;
    return `Community average: ★ ${formatRating(averageScore)} (${formatVoteCount(ratingCount)} ratings)`;
  }, [aggregateQuery.data, aggregateQuery.isError, aggregateQuery.isLoading]);

  const handleSelectScore = (score: number) => {
    if (!requireAuth()) {
      setFeedback('Please sign in to rate this title.');
      return;
    }

    if (isMutating) {
      return;
    }

    setSelectedScore(score);
    rateContent.mutate(score, {
      onSuccess: () => {
        setSelectedScore(null);
        setFeedback('Rating saved.');
      },
      onError: () => {
        setSelectedScore(null);
        setFeedback('Could not update your rating. Please try again.');
      },
    });
  };

  const handleRemoveRating = () => {
    if (!requireAuth()) {
      setFeedback('Please sign in to rate this title.');
      return;
    }

    if (currentScore == null || isMutating) {
      return;
    }

    deleteRating.mutate(undefined, {
      onSuccess: () => {
        setSelectedScore(null);
        setFeedback('Rating removed.');
      },
      onError: (error) => {
        setFeedback(
          isApiError(error)
            ? 'Could not update your rating. Please try again.'
            : 'Could not update your rating. Please try again.',
        );
      },
    });
  };

  return (
    <View style={styles.section}>
      <AppText variant="subtitle">Your Rating</AppText>
      <FeedbackMessage
        message={feedback}
        tone={feedback?.includes('Could not') ? 'error' : 'success'}
        onDismiss={() => setFeedback(null)}
      />

      {isAuthenticated && myRatingQuery.isLoading ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <AppText variant="bodySmall" muted>
          {currentScore != null ? `You rated this ${currentScore}/10.` : 'You have not rated this yet.'}
        </AppText>
      )}

      <View style={styles.scoreRow}>
        {RATING_SCALE.map((score) => {
          const selected = activeScore === score;

          return (
            <Pressable
              key={score}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${score} out of 10`}
              accessibilityState={{ selected, disabled: isMutating }}
              disabled={isMutating}
              onPress={() => handleSelectScore(score)}
              style={({ pressed }) => [
                styles.scoreChip,
                selected && styles.scoreChipSelected,
                pressed && !isMutating && styles.pressed,
                isMutating && styles.disabled,
              ]}
            >
              <AppText variant="caption" style={selected ? styles.scoreChipTextSelected : undefined}>
                {score}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {currentScore != null ? (
        <AppButton
          title="Remove My Rating"
          variant="ghost"
          loading={deleteRating.isPending}
          disabled={isMutating}
          onPress={handleRemoveRating}
        />
      ) : null}

      <View style={styles.aggregateBox}>
        <AppText variant="caption" muted>
          {aggregateLabel}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  scoreChip: {
    minWidth: 34,
    height: 34,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  scoreChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTint18,
  },
  scoreChipTextSelected: {
    color: colors.textPrimary,
  },
  aggregateBox: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
});
