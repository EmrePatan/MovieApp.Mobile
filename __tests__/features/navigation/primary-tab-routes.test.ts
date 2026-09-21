import { resolveActivePrimaryTab } from '@/features/navigation/primary-tab-routes';

describe('primary tab routes', () => {
  it('maps browse and result routes to their owning primary tab', () => {
    expect(resolveActivePrimaryTab('/home')).toBe('home');
    expect(resolveActivePrimaryTab('/search')).toBe('home');
    expect(resolveActivePrimaryTab('/discover-browse')).toBe('discover');
    expect(resolveActivePrimaryTab('/world-cinema')).toBe('discover');
    expect(resolveActivePrimaryTab('/upcoming')).toBe('library');
    expect(resolveActivePrimaryTab('/watchlist/123')).toBe('library');
    expect(resolveActivePrimaryTab('/pick-something')).toBe('insights');
  });

  it('defaults catalog detail routes to the home tab highlight', () => {
    expect(resolveActivePrimaryTab('/movie/abc')).toBe('home');
    expect(resolveActivePrimaryTab('/tv/abc')).toBe('home');
    expect(resolveActivePrimaryTab('/person/42')).toBe('home');
  });
});
