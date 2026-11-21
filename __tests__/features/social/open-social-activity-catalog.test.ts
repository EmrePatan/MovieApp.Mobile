import { openSocialActivityCatalog } from '@/features/social/navigation/open-social-activity-catalog';
import type { SocialFeedItem } from '@/features/social/types';

const baseItem: SocialFeedItem = {
  id: 'a1',
  actorId: 'u1',
  userName: 'user',
  displayName: 'User',
  avatarUrl: null,
  activityType: 'WatchedMovie',
  createdAt: '2026-01-01T00:00:00Z',
  targetContentId: 'movie-1',
  targetContentType: 'Movie',
  targetTitle: 'Title',
  targetSubtitle: null,
  posterPath: null,
  ratingScore: null,
  reviewExcerpt: null,
  reviewId: null,
  reviewAuthoringLocale: null,
  reviewUpdatedAt: null,
  likesCount: 0,
  commentsCount: 0,
  isLikedByMe: false,
};

jest.mock('@/features/details/shared/navigation/open-catalog-detail-from-tab', () => ({
  openCatalogDetailFromTab: jest.fn(),
}));

const { openCatalogDetailFromTab } = jest.requireMock(
  '@/features/details/shared/navigation/open-catalog-detail-from-tab',
) as { openCatalogDetailFromTab: jest.Mock };

describe('openSocialActivityCatalog', () => {
  beforeEach(() => {
    openCatalogDetailFromTab.mockClear();
  });

  it('opens movie catalog from navigation fields', () => {
    const router = { push: jest.fn() } as never;
    const ok = openSocialActivityCatalog(router, {
      ...baseItem,
      catalogNavigationId: 'nav-movie',
      catalogNavigationType: 'movie',
    });

    expect(ok).toBe(true);
    expect(openCatalogDetailFromTab).toHaveBeenCalledWith(router, 'nav-movie', 'movie', 'home', undefined);
  });

  it('falls back to target content for legacy feed items', () => {
    const router = { push: jest.fn() } as never;
    openSocialActivityCatalog(router, baseItem);
    expect(openCatalogDetailFromTab).toHaveBeenCalledWith(router, 'movie-1', 'movie', 'home', undefined);
  });

  it('returns false for episode items without navigation metadata', () => {
    const router = { push: jest.fn() } as never;
    const ok = openSocialActivityCatalog(router, { ...baseItem, targetContentType: 'Episode' });
    expect(ok).toBe(false);
    expect(openCatalogDetailFromTab).not.toHaveBeenCalled();
  });
});