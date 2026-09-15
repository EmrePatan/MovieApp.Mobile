import { DEFAULT_RELEASE_REGION } from '@/features/regions/region-options';

export const NOW_IN_THEATERS_PREVIEW_SIZE = 8;

export const DEFAULT_NOW_IN_THEATERS_PAGE_SIZE = 20;

export interface NowInTheatersRequest {
  releaseRegion: string;
  page?: number;
  pageSize?: number;
}

export interface NowInTheatersState {
  releaseRegion: string;
}

export function createDefaultNowInTheatersState(): NowInTheatersState {
  return {
    releaseRegion: DEFAULT_RELEASE_REGION,
  };
}
