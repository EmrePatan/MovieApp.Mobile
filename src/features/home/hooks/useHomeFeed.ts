import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { mergeProgressiveHomeSections } from '../utils/merge-progressive-home-sections';
import { mapUpcomingCatalogItemsToHomeItems } from '../utils/map-upcoming-catalog-to-home-item';
import { resolveHomeSectionTitle } from '../utils/resolve-home-section-title';
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
  const { t } = useTranslation();
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
      title: resolveHomeSectionTitle('ComingUp', 'Coming Up', t),
      displayOrder: 0,
      items: mapUpcomingCatalogItemsToHomeItems(catalogItems),
    };

    return [...mergedSections, comingUpSection];
  }, [comingUpCatalogFallback.data?.items, hasPersonalizedComingUp, mergedSections, t]);

  const refetchBrowse = browse.refetch;
  const refetchPersonalized = personalized.refetch;
  const refetchComingUpFallback = comingUpCatalogFallback.refetch;

  const refetch = useCallback(async () => {
    const tasks: Array<Promise<unknown>> = [refetchBrowse(), refetchPersonalized()];

    if (!hasPersonalizedComingUp) {
      tasks.push(refetchComingUpFallback());
    }

    await Promise.all(tasks);
  }, [hasPersonalizedComingUp, refetchBrowse, refetchComingUpFallback, refetchPersonalized]);

  const isInitialBrowseLoading = browse.isLoading && !browse.data;
  const isFetching =
    browse.isFetching || personalized.isFetching || comingUpCatalogFallback.isFetching;

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
