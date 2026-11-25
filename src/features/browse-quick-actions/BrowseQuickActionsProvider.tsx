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
import { useAuth } from '@/auth/useAuth';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useFavoriteStatus } from '@/features/favorites/hooks/useFavoriteStatus';
import { useToggleFavorite } from '@/features/favorites/hooks/useFavoriteMutations';
import { useQueryClient } from '@tanstack/react-query';
import { useMyRating } from '@/features/ratings/hooks/useRatings';
import { useRateContent } from '@/features/ratings/hooks/useRatingMutations';
import {
  movieMyRatingQueryKey,
  tvMyRatingQueryKey,
} from '@/features/ratings/hooks/rating-query-keys';
import { getMovieMyRating, getTvMyRating } from '@/features/ratings/api/ratings-api';
import type { RatingResponse } from '@/features/ratings/types';
import { PERSONAL_RATING_PROMPT_CLOSE_DELAY_MS } from '@/features/details/shared/components/DetailPersonalRatingExperience';
import { WatchlistPickerModal } from '@/features/watchlists/components/WatchlistPickerModal';
import { CatalogQuickActionsSheet } from './components/CatalogQuickActionsSheet';
import { BrowseRatingMomentSheet } from './components/BrowseRatingMomentSheet';
import { useBrowseItemWatchState } from './hooks/useBrowseItemWatchState';
import { useToggleBrowseWatched } from './hooks/useToggleBrowseWatched';
import type { BrowseQuickActionsTarget } from './types';

const RATING_PROMPT_DELAY_MS = 320;

interface BrowseQuickActionsContextValue {
  openQuickActions: (target: BrowseQuickActionsTarget) => void;
  toggleWatched: (target: BrowseQuickActionsTarget, isWatched: boolean) => void;
  isWatchedTogglePending: (contentId: string) => boolean;
}

const BrowseQuickActionsContext = createContext<BrowseQuickActionsContextValue | null>(null);

export function useBrowseQuickActions(): BrowseQuickActionsContextValue {
  const value = useContext(BrowseQuickActionsContext);
  if (!value) {
    throw new Error('useBrowseQuickActions must be used within BrowseQuickActionsProvider');
  }
  return value;
}

export function useOptionalBrowseQuickActions(): BrowseQuickActionsContextValue | null {
  return useContext(BrowseQuickActionsContext);
}

interface BrowseQuickActionsProviderProps {
  children: ReactNode;
}

export function BrowseQuickActionsProvider({ children }: BrowseQuickActionsProviderProps) {
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useRequireAuth();
  const queryClient = useQueryClient();
  const [target, setTarget] = useState<BrowseQuickActionsTarget | null>(null);
  const [actionsVisible, setActionsVisible] = useState(false);
  const [watchlistVisible, setWatchlistVisible] = useState(false);
  const [ratingVisible, setRatingVisible] = useState(false);
  const [ratingSessionKey, setRatingSessionKey] = useState(0);
  const [ratingBusy, setRatingBusy] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<BrowseQuickActionsTarget | null>(null);
  const ratingDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ratingCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const contentType = target?.contentType ?? 'movie';
  const contentId = target?.contentId ?? '';
  const actionsOpen = actionsVisible && target != null;

  const watchState = useBrowseItemWatchState(contentType, actionsOpen ? contentId : '');
  const favoriteStatus = useFavoriteStatus(contentType, contentId, { enabled: actionsOpen });
  const toggleFavorite = useToggleFavorite(contentType, contentId);
  const toggleWatchedMutation = useToggleBrowseWatched();

  const ratingType = ratingTarget?.contentType ?? contentType;
  const ratingId = ratingTarget?.contentId ?? contentId;
  const myRating = useMyRating(ratingType, ratingVisible ? ratingId : '');
  const rateContent = useRateContent(ratingType, ratingId);

  const clearRatingDelay = useCallback(() => {
    if (ratingDelayRef.current) {
      clearTimeout(ratingDelayRef.current);
      ratingDelayRef.current = null;
    }
  }, []);

  const clearRatingClose = useCallback(() => {
    if (ratingCloseRef.current) {
      clearTimeout(ratingCloseRef.current);
      ratingCloseRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      clearRatingDelay();
      clearRatingClose();
    },
    [clearRatingClose, clearRatingDelay],
  );

  const closeActions = useCallback(() => {
    setActionsVisible(false);
  }, []);

  const openQuickActions = useCallback(
    (next: BrowseQuickActionsTarget) => {
      if (!requireAuth()) {
        return;
      }
      setTarget(next);
      setWatchlistVisible(false);
      setActionsVisible(true);
    },
    [requireAuth],
  );

  const scheduleRatingPrompt = useCallback(
    (forTarget: BrowseQuickActionsTarget) => {
      clearRatingDelay();
      setRatingTarget(forTarget);
      ratingDelayRef.current = setTimeout(() => {
        ratingDelayRef.current = null;
        void (async () => {
          const queryKey =
            forTarget.contentType === 'movie'
              ? movieMyRatingQueryKey(forTarget.contentId)
              : tvMyRatingQueryKey(forTarget.contentId);
          const existing = queryClient.getQueryData<RatingResponse | null>(queryKey);
          const rating =
            existing ??
            (await queryClient.fetchQuery({
              queryKey,
              queryFn: ({ signal }) =>
                forTarget.contentType === 'movie'
                  ? getMovieMyRating(forTarget.contentId, signal)
                  : getTvMyRating(forTarget.contentId, signal),
            }));

          if (rating?.score != null) {
            return;
          }

          setRatingBusy(false);
          setRatingSessionKey((key) => key + 1);
          setRatingVisible(true);
        })();
      }, RATING_PROMPT_DELAY_MS);
    },
    [clearRatingDelay, queryClient],
  );

  const closeRating = useCallback(() => {
    clearRatingClose();
    setRatingBusy(false);
    setRatingVisible(false);
  }, [clearRatingClose]);

  const runToggleWatched = useCallback(
    (forTarget: BrowseQuickActionsTarget, isWatched: boolean, options?: { closeSheet?: boolean }) => {
      toggleWatchedMutation.mutate(
        { target: forTarget, isWatched },
        {
          onSuccess: (result) => {
            if (options?.closeSheet) {
              closeActions();
            }
            if (result.nextWatched) {
              scheduleRatingPrompt(result.target);
            }
          },
        },
      );
    },
    [closeActions, scheduleRatingPrompt, toggleWatchedMutation],
  );

  const toggleWatched = useCallback(
    (forTarget: BrowseQuickActionsTarget, isWatched: boolean, options?: { closeSheet?: boolean }) => {
      if (!requireAuth()) {
        return;
      }
      runToggleWatched(forTarget, isWatched, options);
    },
    [requireAuth, runToggleWatched],
  );

  const handleToggleWatched = useCallback(() => {
    if (!target) {
      return;
    }
    toggleWatched(target, watchState.isWatched, { closeSheet: true });
  }, [target, toggleWatched, watchState.isWatched]);

  const isWatchedTogglePending = useCallback(
    (id: string) =>
      toggleWatchedMutation.isPending &&
      toggleWatchedMutation.variables?.target.contentId === id,
    [toggleWatchedMutation.isPending, toggleWatchedMutation.variables],
  );

  const handleToggleFavorite = useCallback(() => {
    if (!target) {
      return;
    }
    toggleFavorite.mutate(Boolean(favoriteStatus.data));
  }, [favoriteStatus.data, target, toggleFavorite]);

  const handleOpenWatchlists = useCallback(() => {
    closeActions();
    setWatchlistVisible(true);
  }, [closeActions]);

  const handleSubmitRating = useCallback(
    (backendScore: number) => {
      rateContent.mutate(backendScore, {
        onSuccess: () => {
          setRatingBusy(true);
          clearRatingClose();
          ratingCloseRef.current = setTimeout(() => {
            ratingCloseRef.current = null;
            setRatingVisible(false);
            setRatingBusy(false);
          }, PERSONAL_RATING_PROMPT_CLOSE_DELAY_MS);
        },
      });
    },
    [clearRatingClose, rateContent],
  );

  const contextValue = useMemo(
    () => ({
      openQuickActions,
      toggleWatched: (next: BrowseQuickActionsTarget, isWatched: boolean) =>
        toggleWatched(next, isWatched),
      isWatchedTogglePending,
    }),
    [isWatchedTogglePending, openQuickActions, toggleWatched],
  );

  const watchedBusy =
    toggleWatchedMutation.isPending &&
    toggleWatchedMutation.variables?.target.contentId === contentId;

  return (
    <BrowseQuickActionsContext.Provider value={contextValue}>
      {children}
      <CatalogQuickActionsSheet
        visible={actionsOpen}
        target={target}
        isWatched={watchState.isWatched}
        isFavorited={Boolean(favoriteStatus.data)}
        watchedBusy={watchedBusy}
        favoriteBusy={toggleFavorite.isPending}
        onClose={closeActions}
        onToggleWatched={handleToggleWatched}
        onToggleFavorite={handleToggleFavorite}
        onOpenWatchlists={handleOpenWatchlists}
      />
      {target || ratingTarget ? (
        <WatchlistPickerModal
          visible={watchlistVisible}
          contentType={(target ?? ratingTarget)!.contentType}
          contentId={(target ?? ratingTarget)!.contentId}
          onClose={() => setWatchlistVisible(false)}
        />
      ) : null}
      <BrowseRatingMomentSheet
        visible={ratingVisible && ratingTarget != null && isAuthenticated}
        sessionKey={ratingSessionKey}
        title={ratingTarget?.title ?? ''}
        posterUrl={ratingTarget?.posterUrl ?? null}
        initialBackendScore={myRating.data?.score ?? null}
        isSubmitting={rateContent.isPending || ratingBusy}
        onClose={closeRating}
        onSubmit={handleSubmitRating}
      />
    </BrowseQuickActionsContext.Provider>
  );
}
