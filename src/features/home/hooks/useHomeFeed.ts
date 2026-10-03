import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOnTvThisWeekPreview } from '@/features/discovery/hooks/useOnTvThisWeekPreview';
import { useNowInTheatersPreview } from '@/features/discovery/hooks/useNowInTheatersPreview';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import {
  appendMissingHomeCatalogRails,
  homeResponseIncludesSection,
  omitHomeRailsForTypeFilter,
} from '../utils/append-missing-home-catalog-rails';
import { normalizeHomeComingUpSource } from '../utils/coming-up-source';
import { mapTitleSearchItemsToHomeItems } from '../utils/map-search-item-to-home-item';
import { mergeProgressiveHomeSections } from '../utils/merge-progressive-home-sections';
import { selectHomeComingUpRailItems } from '../utils/home-coming-up-rail-items';
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

export interface UseHomeFeedOptions {
  /** When false, Home network work is paused while another screen has focus. */
  screenActive?: boolean;
}

export function useHomeFeed(
  type: HomeTypeFilter = 'all',
  sectionSize = DEFAULT_HOME_SECTION_SIZE,
  options?: UseHomeFeedOptions,
) {
  const { t } = useTranslation();
  const { region, isHydrated } = useRegionalPreference();
  const screenActive = options?.screenActive ?? true;
  const browse = useHomeBrowse(type, sectionSize, { screenActive });
  const personalized = useHomePersonalized(type, sectionSize, { screenActive });
  const browseSections = browse.data?.sections ?? [];
  const browseSettled = browse.isSuccess || browse.isError;
  const needsOnTvFallback =
    screenActive &&
    browseSettled &&
    type !== 'movie' &&
    !homeResponseIncludesSection(browseSections, 'OnTvThisWeek');
  const needsTheatersFallback =
    screenActive &&
    browseSettled &&
    isHydrated &&
    type !== 'tv' &&
    !homeResponseIncludesSection(browseSections, 'NowInTheaters');
  const onTvFallback = useOnTvThisWeekPreview(needsOnTvFallback);
  const theatersFallback = useNowInTheatersPreview(region, needsTheatersFallback);

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
        (section) =>
          section.type === 'ComingUp' && selectHomeComingUpRailItems(section.items).length > 0,
      ),
    [mergedSections],
  );

  const comingUpCatalogFallback = useHomeComingUpCatalogFallback(
    screenActive && !hasPersonalizedComingUp,
  );

  const sectionsWithComingUp = useMemo(() => {
    if (hasPersonalizedComingUp) {
      return mergedSections
        .map((section) => {
          if (section.type !== 'ComingUp') {
            return section;
          }

          const items = selectHomeComingUpRailItems(section.items);
          if (items.length === 0) {
            return null;
          }

          return {
            ...section,
            items,
            comingUpSource: normalizeHomeComingUpSource(section.comingUpSource, 'for-you'),
          };
        })
        .filter((section): section is HomeSection => section != null);
    }

    const catalogItems = selectHomeComingUpRailItems(
      mapUpcomingCatalogItemsToHomeItems(comingUpCatalogFallback.data?.items ?? []),
    );
    if (catalogItems.length === 0) {
      return mergedSections;
    }

    const comingUpSection: HomeSection = {
      type: 'ComingUp',
      title: resolveHomeSectionTitle('ComingUp', 'Coming Up', t, {
        comingUpSource: 'catalog',
      }),
      displayOrder: 0,
      comingUpSource: 'catalog',
      items: catalogItems,
    };

    return [...mergedSections, comingUpSection];
  }, [comingUpCatalogFallback.data?.items, hasPersonalizedComingUp, mergedSections, t]);

  const sectionsForHome = useMemo(() => {
    const withFallbackRails = appendMissingHomeCatalogRails(sectionsWithComingUp, {
      onTvItems: needsOnTvFallback
        ? mapTitleSearchItemsToHomeItems(onTvFallback.data?.items ?? [])
        : [],
      nowInTheatersItems: needsTheatersFallback
        ? mapTitleSearchItemsToHomeItems(theatersFallback.data?.items ?? [])
        : [],
    });

    return omitHomeRailsForTypeFilter(withFallbackRails, type);
  }, [
    needsOnTvFallback,
    needsTheatersFallback,
    onTvFallback.data?.items,
    sectionsWithComingUp,
    theatersFallback.data?.items,
    type,
  ]);

  const refetchBrowse = browse.refetch;
  const refetchPersonalized = personalized.refetch;
  const refetchComingUpFallback = comingUpCatalogFallback.refetch;
  const refetchOnTvFallback = onTvFallback.refetch;
  const refetchTheatersFallback = theatersFallback.refetch;

  const refetch = useCallback(async () => {
    const tasks: Promise<unknown>[] = [refetchBrowse(), refetchPersonalized()];

    if (!hasPersonalizedComingUp) {
      tasks.push(refetchComingUpFallback());
    }

    if (needsOnTvFallback) {
      tasks.push(refetchOnTvFallback());
    }

    if (needsTheatersFallback) {
      tasks.push(refetchTheatersFallback());
    }

    await Promise.all(tasks);
  }, [
    hasPersonalizedComingUp,
    needsOnTvFallback,
    needsTheatersFallback,
    refetchBrowse,
    refetchComingUpFallback,
    refetchOnTvFallback,
    refetchPersonalized,
    refetchTheatersFallback,
  ]);

  const isInitialBrowseLoading = browse.isLoading && !browse.data;
  const isFetching =
    browse.isFetching ||
    personalized.isFetching ||
    comingUpCatalogFallback.isFetching ||
    (needsOnTvFallback && onTvFallback.isFetching) ||
    (needsTheatersFallback && theatersFallback.isFetching);

  return {
    browse,
    personalized,
    mergedSections: sectionsForHome,
    personalization,
    releaseRegion: region,
    isInitialBrowseLoading,
    isFetching,
    refetch,
  };
}
