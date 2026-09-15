import { useQuery } from '@tanstack/react-query';
import { getExplorePreview } from '../api/discovery-api';
import { DEFAULT_HOME_SECTION_SIZE } from '@/features/home/types';

export function explorePreviewQueryKey(sectionSize = DEFAULT_HOME_SECTION_SIZE) {
  return ['discovery', 'explore-preview', sectionSize] as const;
}

export function useExplorePreview(sectionSize = DEFAULT_HOME_SECTION_SIZE) {
  return useQuery({
    queryKey: explorePreviewQueryKey(sectionSize),
    queryFn: ({ signal }) => getExplorePreview(sectionSize, signal),
    staleTime: 120_000,
  });
}
