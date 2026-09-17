import { useCallback, useMemo } from 'react';
import { mergeProgressiveHomeSections } from '../utils/merge-progressive-home-sections';
import {
  resolvePersonalizationState,
  type PersonalizationState,
} from '../utils/personalization-state';
import type { HomeTypeFilter } from '../types';
import { DEFAULT_HOME_SECTION_SIZE } from '../types';
import { useHomeBrowse } from './useHomeBrowse';
import { useHomePersonalized } from './useHomePersonalized';

export function useHomeFeed(type: HomeTypeFilter = 'all', sectionSize = DEFAULT_HOME_SECTION_SIZE) {
  const browse = useHomeBrowse(type, sectionSize);
  const personalized = useHomePersonalized(type, sectionSize);

  const personalization = useMemo<PersonalizationState>(
    () =>
      resolvePersonalizationState(
        personalized.isLoading,
        personalized.data !== undefined,
        personalized.data?.isPersonalized,
      ),
    [personalized.data, personalized.isLoading],
  );

  const mergedSections = useMemo(
    () => mergeProgressiveHomeSections(browse.data, personalized.data),
    [browse.data, personalized.data],
  );

  const refetch = useCallback(async () => {
    await Promise.all([browse.refetch(), personalized.refetch()]);
  }, [browse, personalized]);

  const isInitialBrowseLoading = browse.isLoading && !browse.data;
  const isFetching = browse.isFetching || personalized.isFetching;

  return {
    browse,
    personalized,
    mergedSections,
    personalization,
    isInitialBrowseLoading,
    isFetching,
    refetch,
  };
}
