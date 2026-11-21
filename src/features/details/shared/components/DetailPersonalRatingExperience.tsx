import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { useAuth } from '@/auth/useAuth';
import { PersonalRatingPromptSheet } from '@/features/ratings/components/PersonalRatingPromptSheet';
import { useDeleteRating, useRateContent } from '@/features/ratings/hooks/useRatingMutations';
import { useMyRating } from '@/features/ratings/hooks/useRatings';
import type { RatingContentType } from '@/features/ratings/types';
import { formatPersonalRatingOutOfFive } from '@/features/ratings/utils/format-personal-rating-display';
import { useEpisodeWatchStatus } from '@/features/watch-history/hooks/useEpisodeWatchStatus';
import { useMovieWatchStatus } from '@/features/watch-history/hooks/useMovieWatchStatus';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface DetailPersonalRatingContextValue {
  openRatingSheet: () => void;
  handleMarkedWatched: () => void;
  /** Deletes any personal rating, then lets unwatch proceed — no confirm sheet. */
  confirmUnwatchIfNeeded: () => Promise<boolean>;
}

const DetailPersonalRatingContext = createContext<DetailPersonalRatingContextValue | null>(
  null,
);

/** Brief pause after a successful rating so the chosen stars stay visible before dismiss. */
export const PERSONAL_RATING_PROMPT_CLOSE_DELAY_MS = 520;

export function useOptionalDetailPersonalRating(): DetailPersonalRatingContextValue | null {
  return useContext(DetailPersonalRatingContext);
}

interface DetailPersonalRatingProviderProps {
  contentType: RatingContentType;
  contentId: string;
  watchEligible: boolean;
  children: ReactNode;
}

export function DetailPersonalRatingProvider({
  contentType,
  contentId,
  watchEligible,
  children,
}: DetailPersonalRatingProviderProps) {
  const { isAuthenticated } = useAuth();
  const myRatingQuery = useMyRating(contentType, contentId);
  const rateContent = useRateContent(contentType, contentId);
  const deleteRating = useDeleteRating(contentType, contentId);
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptSessionKey, setPromptSessionKey] = useState(0);
  const [promptSheetBusy, setPromptSheetBusy] = useState(false);
  const closePromptTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPromptCloseTimeout = useCallback(() => {
    if (closePromptTimeoutRef.current) {
      clearTimeout(closePromptTimeoutRef.current);
      closePromptTimeoutRef.current = null;
    }
  }, []);

  const closePrompt = useCallback(() => {
    clearPromptCloseTimeout();
    setPromptSheetBusy(false);
    setPromptVisible(false);
  }, [clearPromptCloseTimeout]);

  useEffect(() => () => clearPromptCloseTimeout(), [clearPromptCloseTimeout]);

  const openPrompt = useCallback(() => {
    clearPromptCloseTimeout();
    setPromptSheetBusy(false);
    setPromptSessionKey((key) => key + 1);
    setPromptVisible(true);
  }, [clearPromptCloseTimeout]);

  const handleMarkedWatched = useCallback(() => {
    if (!isAuthenticated || !watchEligible) {
      return;
    }

    if (myRatingQuery.data?.score != null) {
      return;
    }

    openPrompt();
  }, [isAuthenticated, watchEligible, myRatingQuery.data?.score, openPrompt]);

  const confirmUnwatchIfNeeded = useCallback(async (): Promise<boolean> => {
    if (myRatingQuery.data?.score == null) {
      return true;
    }

    try {
      await deleteRating.mutateAsync();
      return true;
    } catch {
      return false;
    }
  }, [deleteRating, myRatingQuery.data?.score]);

  const handleSubmitRating = useCallback(
    (backendScore: number) => {
      rateContent.mutate(backendScore, {
        onSuccess: () => {
          setPromptSheetBusy(true);
          clearPromptCloseTimeout();
          closePromptTimeoutRef.current = setTimeout(() => {
            closePromptTimeoutRef.current = null;
            setPromptVisible(false);
          }, PERSONAL_RATING_PROMPT_CLOSE_DELAY_MS);
        },
      });
    },
    [clearPromptCloseTimeout, rateContent],
  );

  const contextValue = useMemo(
    () => ({
      openRatingSheet: openPrompt,
      handleMarkedWatched,
      confirmUnwatchIfNeeded,
    }),
    [confirmUnwatchIfNeeded, handleMarkedWatched, openPrompt],
  );

  return (
    <DetailPersonalRatingContext.Provider value={contextValue}>
      {children}
      <PersonalRatingPromptSheet
        visible={promptVisible}
        sessionKey={promptSessionKey}
        initialBackendScore={myRatingQuery.data?.score ?? null}
        isSubmitting={rateContent.isPending || promptSheetBusy}
        onClose={closePrompt}
        onSubmit={handleSubmitRating}
      />
    </DetailPersonalRatingContext.Provider>
  );
}

interface DetailPersonalRatingRowProps {
  contentType: RatingContentType;
  contentId: string;
  watchEligible: boolean;
}

export function DetailPersonalRatingRow({
  contentType,
  contentId,
  watchEligible,
}: DetailPersonalRatingRowProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const personalRating = useOptionalDetailPersonalRating();
  const myRatingQuery = useMyRating(contentType, contentId);

  const movieStatus = useMovieWatchStatus(contentType === 'movie' ? contentId : '', {
    enabled: contentType === 'movie' && watchEligible && isAuthenticated,
  });
  const episodeStatus = useEpisodeWatchStatus(contentType === 'episode' ? contentId : '');
  const isWatched =
    contentType === 'episode'
      ? (episodeStatus.data?.isWatched ?? false)
      : (movieStatus.data?.isWatched ?? false);

  if (
    !isAuthenticated
    || !watchEligible
    || ((contentType === 'movie' || contentType === 'episode') && !isWatched)
  ) {
    return null;
  }

  const score = myRatingQuery.data?.score ?? null;

  if (score == null) {
    const rateCtaKey =
      contentType === 'episode' ? 'ratings.detail.episodeRateCta' : 'ratings.detail.rateCta';

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(rateCtaKey)}
        onPress={() => personalRating?.openRatingSheet()}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        testID="detail-personal-rating-rate-cta"
      >
        <Ionicons name="star-outline" size={14} color={colors.textMuted} />
        <AppText variant="caption" style={styles.rateCtaText}>
          {t(rateCtaKey)}
        </AppText>
      </Pressable>
    );
  }

  const scoreLabel = t('ratings.detail.scoreOutOfFive', {
    score: formatPersonalRatingOutOfFive(score),
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t('ratings.detail.yourScore')} ${scoreLabel}`}
      onPress={() => personalRating?.openRatingSheet()}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      testID="detail-personal-rating-summary"
    >
      <Ionicons name="star" size={14} color={colors.accentStrong} />
      <AppText variant="caption" style={styles.yourScoreText}>
        {t('ratings.detail.yourScore')}
      </AppText>
      <AppText variant="caption" style={styles.scoreText}>
        {scoreLabel}
      </AppText>
      <AppText variant="caption" style={styles.changeText}>
        {t('ratings.detail.change')}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: layout.screenPaddingHorizontal,
    minHeight: 28,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  rateCtaText: {
    color: colors.textMuted,
    fontWeight: '500',
  },
  yourScoreText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  scoreText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  changeText: {
    color: colors.accent,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});
