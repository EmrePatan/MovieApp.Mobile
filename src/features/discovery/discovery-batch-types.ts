import type { AdvancedDiscoverMediaType } from './advanced-discover-types';
import type { DiscoveryTypeFilter } from './types';
import type { SearchResultItem } from '@/features/search/types';

export interface GenreCoverCandidatesBatchRequest {
  genreIds: string[];
  mediaType?: DiscoveryTypeFilter;
  candidateCount?: number;
}

export type DiscoveryBatchItemStatus = 'ok' | 'transient_error';

export interface GenreCoverCandidatesBatchItem {
  genreId: string;
  status: DiscoveryBatchItemStatus;
  candidates: SearchResultItem[];
}

export interface GenreCoverCandidatesBatchResponse {
  items: GenreCoverCandidatesBatchItem[];
}

export interface ProviderPreviewsBatchRequest {
  providerIds: number[];
  mediaType: AdvancedDiscoverMediaType;
  watchRegion: string;
  pageSize?: number;
}

export interface ProviderPreviewBatchItem {
  providerId: number;
  status: DiscoveryBatchItemStatus;
  items: SearchResultItem[];
}

export interface ProviderPreviewsBatchResponse {
  items: ProviderPreviewBatchItem[];
}
