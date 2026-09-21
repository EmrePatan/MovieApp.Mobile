import {
  ROUTE_OWNERSHIP_AUDIT,
  ROUTE_OWNERSHIP_FIRST_DIVERGENCE,
} from '@/debug/route-ownership-audit';

describe('route ownership audit', () => {
  it('documents nested Cast ownership vs root-stack discover-browse', () => {
    expect(ROUTE_OWNERSHIP_AUDIT.castSeeAll.navigatorDepth).toBe(3);
    expect(ROUTE_OWNERSHIP_AUDIT.discoverBrowse.navigatorDepth).toBe(1);
    expect(ROUTE_OWNERSHIP_AUDIT.castSeeAll.navigation).toContain('withAnchor: true');
    expect(ROUTE_OWNERSHIP_AUDIT.discoverBrowse.navigation).toContain('withAnchor: false');
    expect(ROUTE_OWNERSHIP_FIRST_DIVERGENCE.length).toBeGreaterThan(0);
  });
});
