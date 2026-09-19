import type { SearchContentType } from '@/models/api/pagination';
import type { RecommendationItem } from '@/features/recommendations/types';

export type PickSomethingMediaType = SearchContentType;

export interface PickSomethingRequest {
  mediaType?: PickSomethingMediaType;
  excludeIds?: string[];
}

export interface PickSomethingResponse {
  item: RecommendationItem | null;
}

export const PICK_SOMETHING_MEDIA_OPTIONS: ReadonlyArray<PickSomethingMediaType> = [
  'all',
  'movie',
  'tv',
];
