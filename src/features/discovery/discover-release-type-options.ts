import type { DiscoverReleaseType } from './advanced-discover-types';

export interface DiscoverReleaseTypeOption {
  value: DiscoverReleaseType;
  labelKey: string;
}

export const DISCOVER_RELEASE_TYPE_OPTIONS: DiscoverReleaseTypeOption[] = [
  { value: 'premiere', labelKey: 'premiere' },
  { value: 'theatrical_limited', labelKey: 'theatricalLimited' },
  { value: 'theatrical', labelKey: 'theatrical' },
  { value: 'digital', labelKey: 'digital' },
  { value: 'physical', labelKey: 'physical' },
  { value: 'television', labelKey: 'television' },
];
