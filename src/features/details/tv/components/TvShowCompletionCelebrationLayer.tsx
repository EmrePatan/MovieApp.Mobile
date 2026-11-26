import { useEffect, useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import { ShowCompletedConfettiOverlay } from '@/features/watch-history/components/ShowCompletedConfettiOverlay';
import { useHoldWatchHistoryHint } from '@/features/watch-history/hooks/useHoldWatchHistoryHint';
import { useShowCompletionCelebration } from '@/features/watch-history/hooks/useShowCompletionCelebration';
import { useTvShowProgress } from '@/features/watch-history/hooks/useTvShowProgress';
import { useOptionalDetailPersonalRating } from '@/features/details/shared/components/DetailPersonalRatingExperience';
import { subscribeTvShowCompletionCelebration } from '@/features/watch-history/utils/tv-show-completion-celebration-requests';

interface TvShowCompletionCelebrationLayerProps {
  tvShowId: string;
}

export function TvShowCompletionCelebrationLayer({
  tvShowId,
}: TvShowCompletionCelebrationLayerProps) {
  const { isAuthenticated } = useAuth();
  const tvProgressQuery = useTvShowProgress(tvShowId);
  const progressReady =
    !isAuthenticated ||
    (!tvProgressQuery.isLoading && !tvProgressQuery.isError && tvProgressQuery.data != null);
  const tvProgress = tvProgressQuery.data;
  const personalRating = useOptionalDetailPersonalRating();
  const [forceToken, setForceToken] = useState(0);

  useEffect(() => {
    return subscribeTvShowCompletionCelebration((requestedId) => {
      if (requestedId === tvShowId) {
        setForceToken((token) => token + 1);
      }
    });
  }, [tvShowId]);

  const { confettiVisible, dismissConfetti } = useShowCompletionCelebration({
    isCompleted: tvProgress?.isCompleted === true,
    enabled: isAuthenticated && progressReady,
    onCompleted: personalRating?.handleMarkedWatched,
    forceToken,
  });
  useHoldWatchHistoryHint(confettiVisible);

  return (
    <ShowCompletedConfettiOverlay visible={confettiVisible} onDismiss={dismissConfetti} />
  );
}
