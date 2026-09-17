import type { HomeSection } from '@/features/home/types';
import type { PersonalizationState } from '@/features/home/utils/personalization-state';

const BROWSE_SECTION_TYPES = new Set(['HotThisWeek', 'Trending', 'TopRated', 'NewReleases']);
const PERSONALIZED_SECTION_TYPES = new Set(['RecommendedForYou', 'ComingUp']);

interface LegacyHomeQueryMock {
  data?: {
    sections: HomeSection[];
    isPersonalized: boolean;
  };
  error?: unknown;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  refetch: jest.Mock;
  personalizedLoading?: boolean;
  personalizedError?: unknown;
  browseError?: unknown;
  personalization?: PersonalizationState;
}

export function createHomeFeedMockReturnValue(options: LegacyHomeQueryMock) {
  const sections = options.data?.sections ?? [];
  const browseSections = sections.filter((section) => BROWSE_SECTION_TYPES.has(section.type));
  const personalizedSections = sections.filter((section) =>
    PERSONALIZED_SECTION_TYPES.has(section.type),
  );
  const isPersonalized = options.data?.isPersonalized ?? false;
  const browseLoading = options.isLoading ?? false;
  const personalizedLoading = options.personalizedLoading ?? false;
  const browseHasData = !browseLoading && !options.browseError && options.data !== undefined;
  const personalizedHasData =
    !personalizedLoading && !options.personalizedError && options.data !== undefined;
  const personalization =
    options.personalization ??
    (personalizedLoading ? 'unknown' : isPersonalized ? 'personalized' : 'not-personalized');

  const mergedSections = [
    ...(browseHasData ? browseSections : []),
    ...(personalizedHasData ? personalizedSections : []),
  ];

  return {
    browse: {
      data: browseHasData
        ? { sections: browseSections, generatedAtUtc: '2026-01-01T00:00:00Z' }
        : undefined,
      error: options.browseError ?? (options.isError && !browseHasData ? options.error : null),
      isLoading: browseLoading,
      isFetching: options.isFetching ?? browseLoading,
      isError: Boolean(options.browseError ?? (options.isError && !browseHasData)),
      refetch: options.refetch,
    },
    personalized: {
      data: personalizedHasData
        ? {
            sections: personalizedSections,
            isPersonalized,
            generatedAtUtc: '2026-01-01T00:00:00Z',
          }
        : undefined,
      error: options.personalizedError ?? null,
      isLoading: personalizedLoading,
      isFetching: options.isFetching ?? personalizedLoading,
      isError: Boolean(options.personalizedError),
      refetch: options.refetch,
    },
    mergedSections,
    personalization,
    isInitialBrowseLoading: browseLoading && !browseHasData,
    isFetching:
      options.isFetching ?? (browseLoading || personalizedLoading),
    refetch: options.refetch,
  };
}
