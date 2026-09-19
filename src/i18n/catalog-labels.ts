import type {
  AdvancedDiscoverMediaType,
  AdvancedDiscoverSort,
} from '@/features/discovery/advanced-discover-types';
import type { PickSomethingMediaType } from '@/features/discovery/pick-something-types';
import type { WatchMonetizationType } from '@/features/discovery/watch-provider-types';
import type {
  DiscoveryBrowseMode,
  DiscoverySort,
  DiscoveryTypeFilter,
} from '@/features/discovery/types';
import type { LibraryCategory } from '@/features/library/types/library';
import type { LibrarySortOption } from '@/features/library/types';
import { normalizeMovieDnaGenreName } from '@/features/insights/utils/movie-dna-genre-titles';
import { i18n } from './index';

export type CatalogContentType =
  | 'movie'
  | 'tv'
  | 'person'
  | 'collection'
  | 'episode'
  | 'tvShow'
  | 'tvEpisode'
  | 'either';

export type LibraryStatusKey = 'watching' | 'watched' | 'favorite' | 'watchlist' | 'saved';

export type MovieDnaEditorialCode =
  | 'recent_releases'
  | 'series_first'
  | 'movie_first'
  | 'top_genre';

export type MovieDnaEditorialFallbackKey =
  | 'findingSignature'
  | 'balancedMix'
  | 'seriesHeavy'
  | 'movieHeavy'
  | 'genreCircle'
  | 'default';

const KNOWN_CREW_DEPARTMENTS = new Set([
  'directing',
  'creator',
  'writing',
  'production',
  'camera',
  'sound',
  'editing',
  'art',
  'costume & make-up',
  'visual effects',
  'crew',
  'other',
]);

function normalizeCrewDepartment(department: string): string {
  return department.trim().toLowerCase();
}

export function translateContentType(type: CatalogContentType | 'all'): string {
  if (type === 'all') {
    return i18n.t('common.all');
  }

  return i18n.t(`contentType.${type}`);
}

export function translateDiscoveryBrowseMode(mode: DiscoveryBrowseMode): string {
  return i18n.t(`discovery.modes.${mode}`);
}

export function translateDiscoverySort(sort: DiscoverySort): string {
  return i18n.t(`discovery.sortOptions.${sort}`);
}

export function translateDiscoveryTypeFilter(type: DiscoveryTypeFilter): string {
  return i18n.t(`discovery.typeOptions.${type}`);
}

export function translateLibrarySort(sort: LibrarySortOption): string {
  const key =
    sort === 'ratingDesc' ? 'ratingDesc' : sort === 'titleAsc' ? 'titleAsc' : 'recentlyAdded';
  return i18n.t(`library.sort.${key}`);
}

export function translateLibraryCategory(category: LibraryCategory): string {
  const key =
    category === 'liked'
      ? 'favorites'
      : category === 'watchlist'
        ? 'watchlists'
        : category;
  return i18n.t(`library.categories.${key}`);
}

export function translateLibraryStatus(status: LibraryStatusKey): string {
  return i18n.t(`library.status.${status}`);
}

export function translateAchievementCategory(category: string): string {
  const knownCategories = new Set(['movies', 'episodes', 'ratings', 'shows', 'genres']);
  if (knownCategories.has(category)) {
    return i18n.t(`insights.milestones.categories.${category}`);
  }

  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function translateMovieDnaGenreTitle(genreName: string): string {
  const normalized = normalizeMovieDnaGenreName(genreName);
  const key = `insights.movieDna.genreTitles.${normalized}`;
  if (i18n.exists(key)) {
    return i18n.t(key);
  }

  return i18n.t('insights.movieDna.fallbackExplorer', { genreName: genreName.trim() });
}

export function translateMovieDnaEditorialByCode(code: MovieDnaEditorialCode): string {
  return i18n.t(`insights.movieDna.editorialByCode.${code}`);
}

export function translateMovieDnaEditorialFallback(key: MovieDnaEditorialFallbackKey): string {
  return i18n.t(`insights.movieDna.editorialFallback.${key}`);
}

export function translateCrewDepartment(department: string | null | undefined): string | null {
  if (!department || department.trim().length === 0) {
    return i18n.t('details.crewDepartments.other');
  }

  const normalized = normalizeCrewDepartment(department);
  if (!KNOWN_CREW_DEPARTMENTS.has(normalized)) {
    return null;
  }

  return i18n.t(`details.crewDepartments.${normalized}`);
}

export function translateWatchProviderType(type: WatchMonetizationType): string {
  return i18n.t(`discovery.watchProviders.monetization.${type}`);
}

export function translatePickSomethingType(type: PickSomethingMediaType): string {
  const key = type === 'all' ? 'all' : type;
  return i18n.t(`discovery.pickSomething.mediaOptions.${key}`);
}

export function translateAdvancedDiscoverMediaType(type: AdvancedDiscoverMediaType): string {
  return i18n.t(`discovery.advancedDiscover.mediaOptions.${type}`);
}

export function translateAdvancedDiscoverSort(sort: AdvancedDiscoverSort): string {
  return i18n.t(`discovery.advancedDiscover.sortOptions.${sort}`);
}

export function translateAdvancedDiscoverRuntimePreset(presetKey: string): string {
  return i18n.t(`discovery.advancedDiscover.runtimePresets.${presetKey}`);
}

export function translateAdvancedDiscoverTitle(): string {
  return i18n.t('discovery.advancedDiscover.title');
}

export function translateWorldCinemaSort(sort: AdvancedDiscoverSort): string {
  return i18n.t(`discovery.worldCinemaScreen.sortOptions.${sort}`);
}

export function translateWorldCinemaCollection(countryCode: string): string {
  const key = `discover.worldCinemaHub.collections.${countryCode}`;
  if (i18n.exists(key)) {
    return i18n.t(key);
  }

  return countryCode;
}

export function translateOriginCountryLabel(countryCode: string): string {
  const normalized = countryCode.trim().toUpperCase();
  const key = `discover.worldCinemaHub.countryLabels.${normalized}`;
  if (i18n.exists(key)) {
    return i18n.t(key);
  }

  return normalized;
}
