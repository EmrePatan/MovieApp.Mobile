import { useQuery } from '@tanstack/react-query';
import { getPickSomething } from '../api/discovery-api';
import type { PickSomethingMediaType } from '../pick-something-types';
import { pickSomethingQueryKey } from './pick-something-query-keys';

export function usePickSomething(
  mediaType: PickSomethingMediaType,
  excludeIds: readonly string[],
) {
  return useQuery({
    queryKey: pickSomethingQueryKey(mediaType, excludeIds),
    queryFn: ({ signal }) =>
      getPickSomething(
        {
          mediaType,
          excludeIds: [...excludeIds],
        },
        signal,
      ),
    staleTime: 0,
    gcTime: 0,
  });
}
