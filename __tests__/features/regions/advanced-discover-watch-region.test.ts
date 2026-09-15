import {
  createDefaultAdvancedDiscoverFilters,
  resolveAdvancedDiscoverWatchRegion,
} from '@/features/discovery/advanced-discover-types';

describe('resolveAdvancedDiscoverWatchRegion', () => {
  it('does not inject watchRegion when streaming filters are inactive', () => {
    const filters = createDefaultAdvancedDiscoverFilters();

    expect(resolveAdvancedDiscoverWatchRegion(filters, 'TR')).toBeNull();
  });

  it('defaults watchRegion to userRegion when streaming filters are active', () => {
    const filters = {
      ...createDefaultAdvancedDiscoverFilters(),
      watchProviderIds: [8],
      watchMonetizationTypes: ['stream'] as const,
      watchRegion: null,
    };

    expect(resolveAdvancedDiscoverWatchRegion(filters, 'US')).toBe('US');
  });

  it('keeps explicit watchRegion when provided', () => {
    const filters = {
      ...createDefaultAdvancedDiscoverFilters(),
      watchProviderIds: [8],
      watchMonetizationTypes: ['stream'] as const,
      watchRegion: 'GB',
    };

    expect(resolveAdvancedDiscoverWatchRegion(filters, 'TR')).toBe('GB');
  });
});
