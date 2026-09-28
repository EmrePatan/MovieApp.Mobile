import { buildCatalogShareMessage } from '@/features/sharing/build-catalog-share-message';
import { buildCatalogShareUrl } from '@/features/sharing/build-catalog-share-url';
import { parseCatalogDeepLink } from '@/auth/catalog-deep-link';
import { resolveCatalogDeepLinkRouterPath } from '@/auth/catalog-deep-link-route';

const MOVIE_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const TV_ID = '4fa85f64-5717-4562-b3fc-2c963f66afa7';

describe('catalog share URL builder', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_APP_WEB_URL = 'https://moviecaveapp.com';
    process.env.EXPO_PUBLIC_APP_ENV = 'development';
  });

  it('builds movie HTTPS share URL', () => {
    expect(
      buildCatalogShareUrl({ contentType: 'movie', contentId: MOVIE_ID }),
    ).toBe(`https://moviecaveapp.com/movie/${encodeURIComponent(MOVIE_ID)}`);
  });

  it('builds tv HTTPS share URL', () => {
    expect(buildCatalogShareUrl({ contentType: 'tv', contentId: TV_ID })).toBe(
      `https://moviecaveapp.com/tv/${encodeURIComponent(TV_ID)}`,
    );
  });

  it('localizes share message with HTTPS URL', () => {
    const t = (key: string) =>
      key === 'sharing.viewOnMovieCave' ? 'View on Movie Cave' : key;

    const { message, url } = buildCatalogShareMessage({
      contentType: 'movie',
      contentId: MOVIE_ID,
      title: 'Reacher',
      releaseDate: '2022-02-04',
      t,
    });

    expect(url).toContain('https://moviecaveapp.com/movie/');
    expect(message).toContain('Reacher (2022)');
    expect(message).toContain('View on Movie Cave');
    expect(message).not.toContain('movieapp://');
  });
});

describe('catalog deep links', () => {
  it('maps HTTPS movie link to movie detail route', () => {
    expect(
      resolveCatalogDeepLinkRouterPath(`https://moviecaveapp.com/movie/${MOVIE_ID}`),
    ).toBe(`/movie/${MOVIE_ID}`);
  });

  it('maps HTTPS tv link to tv detail route', () => {
    expect(resolveCatalogDeepLinkRouterPath(`https://moviecaveapp.com/tv/${TV_ID}`)).toBe(
      `/tv/${TV_ID}`,
    );
  });

  it('maps custom scheme movie link', () => {
    expect(parseCatalogDeepLink(`movieapp://movie/${MOVIE_ID}`)?.kind).toBe('movie');
  });

  it('ignores malformed incoming URLs', () => {
    expect(parseCatalogDeepLink('movieapp://not-a-route')).toBeNull();
    expect(parseCatalogDeepLink('https://moviecaveapp.com/person/1')).toBeNull();
  });
});
