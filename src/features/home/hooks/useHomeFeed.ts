import { useCallback, useMemo } from 'react';
import { mergeProgressiveHomeSections } from '../utils/merge-progressive-home-sections';
import { mapUpcomingCatalogItemsToHomeItems } from '../utils/map-upcoming-catalog-to-home-item';
import {
  resolvePersonalizationState,
  type PersonalizationState,
} from '../utils/personalization-state';
import type { HomeSection, HomeTypeFilter } from '../types';
import { DEFAULT_HOME_SECTION_SIZE } from '../types';
import { useHomeBrowse } from './useHomeBrowse';
import { useHomeComingUpCatalogFallback } from './useHomeComingUpCatalogFallback';
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

  const hasPersonalizedComingUp = useMemo(
    () =>
      mergedSections.some(
        (section) => section.type === 'ComingUp' && section.items.length > 0,
      ),
    [mergedSections],
  );

  const comingUpCatalogFallback = useHomeComingUpCatalogFallback(!hasPersonalizedComingUp);

  const sectionsWithComingUp = useMemo(() => {
    if (hasPersonalizedComingUp) {
      return mergedSections;
    }

    const catalogItems = comingUpCatalogFallback.data?.items ?? [];
    if (catalogItems.length === 0) {
      return mergedSections;
    }

    const comingUpSection: HomeSection = {
      type: 'ComingUp',
      title: 'Coming Up',
      displayOrder: 0,
      items: mapUpcomingCatalogItemsToHomeItems(catalogItems),
    };

    return [...mergedSections, comingUpSection];
  }, [comingUpCatalogFallback.data?.items, hasPersonalizedComingUp, mergedSections]);

  const refetch = useCallback(async () => {
    await Promise.all([
      browse.refetch(),
      personalized.refetch(),
      comingUpCatalogFallback.refetch(),
    ]);
  }, [browse, comingUpCatalogFallback, personalized]);

  const isInitialBrowseLoading = browse.isLoading && !browse.data;
  const isFetching = browse.isFetching || personalized.isFetching;

  return {
    browse,
    personalized,
    mergedSections: sectionsWithComingUp,
    personalization,
    isInitialBrowseLoading,
    isFetching,
    refetch,
  };
}
