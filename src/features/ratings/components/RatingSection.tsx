import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      return t('common.loadingCommunityRatings');
    }

    if (aggregateQuery.isError || !aggregateQuery.data) {
      return t('ratings.communityUnavailable');
    }

    const { averageScore, ratingCount } = aggregateQuery.data;
    return t('ratings.communityAverageLine', {
      average: formatRating(averageScore),
      count: formatVoteCount(ratingCount),
    });
  }, [aggregateQuery.data, aggregateQuery.isError, aggregateQuery.isLoading, t]);

  const handleSelectScore = (score: number) => {
    if (!requireAuth()) {
      setFeedback(t('ratings.signInRequired'));
      return;
    }

    if (isMutating) {
      return;
    }

    setSelectedScore(score);
    rateContent.mutate(score, {
      onSuccess: () => {
        setSelectedScore(null);
        setFeedback(t('ratings.saved'));
      },
      onError: () => {
        setSelectedScore(null);
        setFeedback(t('ratings.updateError'));
      },
    });
  };

  const handleRemoveRating = () => {
    if (!requireAuth()) {
      setFeedback(t('ratings.signInRequired'));
      return;
    }

    if (currentScore == null || isMutating) {
      return;
    }

    deleteRating.mutate(undefined, {
      onSuccess: () => {
        setSelectedScore(null);
        setFeedback(t('ratings.removed'));
      },
      onError: (error) => {
        setFeedback(t('ratings.removeError'));
      },
    });
  };

  return (
    <View style={styles.section}>
      <AppText variant="subtitle">{t('ratings.yourRating')}</AppText>
      <FeedbackMessage
        message={feedback}
        tone={
          feedback === t('ratings.removed') || feedback === t('ratings.saved')
            ? 'success'
            : feedback === t('ratings.signInRequired')
              ? 'info'
              : feedback
                ? 'error'
                : 'info'
        }
        onDismiss={() => setFeedback(null)}
      />

      {isAuthenticated && myRatingQuery.isLoading ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <AppText variant="bodySmall" muted>
          {currentScore != null
            ? t('ratings.youRated', { score: currentScore })
            : t('ratings.notRatedYet')}
        </AppText>
      )}

      <View style={styles.scoreRow}>
        {RATING_SCALE.map((score) => {
          const selected = activeScore === score;

          return (
            <Pressable
              key={score}
              accessibilityRole="button"
              accessibilityLabel={t('ratings.rateOutOfTen', { score })}
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
          title={t('ratings.removeMyRating')}
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
