import {
  createDefaultAdvancedDiscoverFilters,
  type AdvancedDiscoverRequest,
} from '../advanced-discover-types';

export function buildAdvancedDiscoverRequest(
  input: Partial<AdvancedDiscoverRequest> & Pick<AdvancedDiscoverRequest, 'mediaType'>,
): AdvancedDiscoverRequest {
  return {
    ...createDefaultAdvancedDiscoverFilters(),
    ...input,
  };
}
