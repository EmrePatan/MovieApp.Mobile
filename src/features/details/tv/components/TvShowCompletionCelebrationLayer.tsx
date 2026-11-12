import { useAuth } from '@/auth/useAuth';
import { ShowCompletedConfettiOverlay } from '@/features/watch-history/components/ShowCompletedConfettiOverlay';
import { useShowCompletionCelebration } from '@/features/watch-history/hooks/useShowCompletionCelebration';
import { useTvShowProgress } from '@/features/watch-history/hooks/useTvShowProgress';
import { useOptionalDetailPersonalRating } from '@/features/details/shared/components/DetailPersonalRatingExperience';

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

  const { confettiVisible, dismissConfetti } = useShowCompletionCelebration({
    isCompleted: tvProgress?.isCompleted === true,
    enabled: isAuthenticated && progressReady,
    onCompleted: personalRating?.handleMarkedWatched,
  });

  return (
    <ShowCompletedConfettiOverlay visible={confettiVisible} onDismiss={dismissConfetti} />
  );
}
