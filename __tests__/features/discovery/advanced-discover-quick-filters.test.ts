import { createDefaultAdvancedDiscoverFilters } from '@/features/discovery/advanced-discover-types';
import {
  isQuickFilterActive,
  toggleQuickFilter,
} from '@/features/discovery/utils/advanced-discover-quick-filters';

describe('advanced discover quick filters', () => {
  it('toggles runtime and rating shortcuts', () => {
    const base = createDefaultAdvancedDiscoverFilters();

    const withRuntime = toggleQuickFilter('runtime90to120', base, 'US');
    expect(isQuickFilterActive('runtime90to120', withRuntime)).toBe(true);

    const cleared = toggleQuickFilter('runtime90to120', withRuntime, 'US');
    expect(cleared.minRuntimeMinutes).toBeNull();
    expect(cleared.maxRuntimeMinutes).toBeNull();

    const withRating = toggleQuickFilter('rating7Plus', base, 'US');
    expect(withRating.minRating).toBe(7);
  });

  it('adds streaming monetization and region when enabling streaming shortcut', () => {
    const base = createDefaultAdvancedDiscoverFilters();
    const next = toggleQuickFilter('streaming', base, 'TR');

    expect(next.watchMonetizationTypes).toEqual(['stream']);
    expect(next.watchRegion).toBe('TR');
  });
});
