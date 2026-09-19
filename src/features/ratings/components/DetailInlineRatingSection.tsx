import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface DetailInlineRatingSectionProps {
  contentType: RatingContentType;
  contentId: string;
}

export function DetailInlineRatingSection({
  contentType,
  contentId,
}: DetailInlineRatingSectionProps) {
  const { t } = useTranslation();
  const { requireAuth } = useRequireAuth();
  const scrollLock = useDetailScrollLock();
  const myRatingQuery = useMyRating(contentType, contentId);
  const aggregateQuery = useRatingAggregate(contentType, contentId);
  const rateContent = useRateContent(contentType, contentId);
  const deleteRating = useDeleteRating(contentType, contentId);
  const [previewRating, setPreviewRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const serverScore = myRatingQuery.data?.score ?? null;
  const serverStarRating =
    serverScore != null ? backendScoreToStarRating(serverScore) : null;
  const displayStarRating = previewRating ?? serverStarRating;
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
    setPreviewRating(starRating);
    setFeedback(null);

    rateContent.mutate(backendScore, {
      onError: () => {
        setPreviewRating(null);
        setFeedback(t('ratings.saveError'));
      },
      onSuccess: () => {
        setPreviewRating(null);
      },
    });
  };

  const handleClear = () => {
    if (!requireAuth() || isPending || serverScore == null) {
      return;
    }

    setPreviewRating(null);
    setFeedback(null);

    deleteRating.mutate(undefined, {
      onError: () => {
        setFeedback(t('ratings.removeError'));
      },
    });
  };

  return (
    <View style={styles.section} testID="detail-inline-rating-section">
      <View style={styles.header} accessibilityRole="header">
        <AppText variant="subtitle" style={styles.headerTitle}>
          {t('ratings.yourRating')}
        </AppText>
      </View>

      <View style={styles.ratingRow} testID="star-rating-row">
        <StarRatingSelector
          value={displayStarRating}
          disabled={isPending}
          onGestureStart={() => requireAuth()}
          onInteractionActiveChange={(active) => scrollLock?.setScrollLocked(active)}
          onPreviewChange={setPreviewRating}
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
            {t('ratings.community')}
          </AppText>
          <AppText variant="caption" style={styles.communityValue}>
            {t('ratings.communityAverageDisplay', { stars: communityMeta.stars })}
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
    marginTop: spacing.sm,
  },
  header: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing.xs,
  },
  headerTitle: {
    color: colors.textPrimary,
    letterSpacing: 0.15,
  },
  ratingRow: {
    width: '100%',
    alignItems: 'center',
  },
  communityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
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
