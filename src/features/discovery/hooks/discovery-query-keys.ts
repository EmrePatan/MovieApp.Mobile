import type { DiscoveryKind, DiscoveryTypeFilter } from '../types';
import { DEFAULT_DISCOVERY_PAGE_SIZE } from '../types';

export function discoveryInfiniteQueryKey(
  kind: DiscoveryKind,
  type: DiscoveryTypeFilter = 'all',
  pageSize = DEFAULT_DISCOVERY_PAGE_SIZE,
) {
  return ['discovery', kind, type, pageSize] as const;
}
