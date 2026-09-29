import type { SearchAutocompleteItem, SearchResultItem } from '../types';
import { isPersonSearchResult } from '../types';
import type { RecentSearchEntityPayload } from './recent-search-types';

export function mapSearchResultToRecentEntity(item: SearchResultItem): RecentSearchEntityPayload | null {
  if (isPersonSearchResult(item)) {
    return {
      entityType: 'person',
      catalogId: item.id,
      tmdbId: item.tmdbId,
      title: item.title,
      posterUrl: item.posterUrl,
    };
  }

  return {
    entityType: item.type,
    catalogId: item.id,
    title: item.title,
    posterUrl: item.posterUrl,
  };
}

export function mapAutocompleteToRecentEntity(
  suggestion: SearchAutocompleteItem,
): RecentSearchEntityPayload | null {
  if (suggestion.type === 'person') {
    if (!suggestion.tmdbId) {
      return null;
    }

    return {
      entityType: 'person',
      catalogId: suggestion.id,
      tmdbId: suggestion.tmdbId,
      title: suggestion.title,
      posterUrl: suggestion.posterUrl,
    };
  }

  if (suggestion.type === 'movie' || suggestion.type === 'tv') {
    return {
      entityType: suggestion.type,
      catalogId: suggestion.id,
      title: suggestion.title,
      posterUrl: suggestion.posterUrl,
      tmdbId: suggestion.tmdbId ?? undefined,
    };
  }

  return null;
}
