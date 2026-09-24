import { useAuth } from '@/auth/useAuth';
import { ShowCompletedConfettiOverlay } from '@/features/watch-history/components/ShowCompletedConfettiOverlay';
import { useShowCompletionCelebration } from '@/features/watch-history/hooks/useShowCompletionCelebration';
import { useTvShowProgress } from '@/features/watch-history/hooks/useTvShowProgress';

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

  const { confettiVisible, dismissConfetti } = useShowCompletionCelebration({
    isCompleted: tvProgress?.isCompleted === true,
    enabled: isAuthenticated && progressReady,
  });

  return (
    <ShowCompletedConfettiOverlay visible={confettiVisible} onDismiss={dismissConfetti} />
  );
}
