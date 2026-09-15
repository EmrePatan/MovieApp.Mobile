import { buildUpcomingCatalogPath } from '@/features/upcoming/api/routes';

describe('buildUpcomingCatalogPath', () => {
  it('includes followed scope for personalized coming up requests', () => {
    expect(buildUpcomingCatalogPath({ page: 1, pageSize: 20, scope: 'followed' }))
      .toBe('/api/catalog/upcoming?page=1&pageSize=20&scope=followed');
  });
});
