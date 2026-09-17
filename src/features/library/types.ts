import type { SearchTypeFilter } from '@/features/search/types';

export type LibraryTypeFilter = SearchTypeFilter;

export type CatalogMediaFilter = 'all' | 'movie' | 'tv';

export type LibrarySortOption = 'recentlyAdded' | 'titleAsc' | 'ratingDesc';

export type LibraryRemoveIcon = 'heart' | 'bookmark' | 'close';
