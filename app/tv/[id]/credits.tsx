import { CreditsDetailContent } from '@/features/details/credits/components/CreditsDetailContent';
import { useCreditsRouteState } from '@/features/details/credits/hooks/useCreditsRouteState';
import { useTvShowCredits } from '@/features/details/credits/hooks/useCredits';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';

export default function TvCreditsScreen() {
  const { resolvedId, isActive, isInvalid, title } = useCreditsRouteState('tv');
  const query = useTvShowCredits(isActive && resolvedId ? resolvedId : '');

  if (!isActive) {
    return null;
  }

  return (
    <DetailQueryState
      query={query}
      contentLayout="list"
      invalidParamsMessage={isInvalid ? 'The credits link is invalid.' : undefined}
      notFoundTitle="Credits not found"
      notFoundMessage="Cast and crew could not be found for this title."
    >
      {(credits) => (
        <CreditsDetailContent
          contentType="tv"
          contentId={resolvedId ?? ''}
          credits={credits}
          title={title}
        />
      )}
    </DetailQueryState>
  );
}
