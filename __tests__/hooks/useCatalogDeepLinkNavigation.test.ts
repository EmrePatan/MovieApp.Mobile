import * as Linking from 'expo-linking';
import { useCatalogDeepLinkNavigation } from '@/hooks/useCatalogDeepLinkNavigation';
import { useAuth } from '@/auth/useAuth';
import {
  captureCatalogDeepLink,
  peekPendingCatalogDeepLinkPath,
  resetPendingCatalogDeepLinkForTests,
} from '@/auth/pending-catalog-deep-link';
import { trackProductMetric } from '@/features/metrics/track-product-metric';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';

jest.mock('@/auth/useAuth');
jest.mock('@/features/metrics/track-product-metric', () => ({
  trackProductMetric: jest.fn(),
}));

const MOVIE_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const MOVIE_URL = `movieapp://movie/${MOVIE_ID}`;
const MOVIE_PATH = `/movie/${MOVIE_ID}`;

describe('useCatalogDeepLinkNavigation', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    resetPendingCatalogDeepLinkForTests();
    (Linking.addEventListener as jest.Mock).mockImplementation(() => ({ remove: jest.fn() }));

    const expoRouter = jest.requireMock('expo-router');
    expoRouter.useRouter.mockReturnValue({ push });
  });

  it('peeks and leaves the pending catalog path while signed out', () => {
    captureCatalogDeepLink(MOVIE_URL);
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    useCatalogDeepLinkNavigation();

    expect(push).not.toHaveBeenCalled();
    expect(trackProductMetric).not.toHaveBeenCalled();
    expect(peekPendingCatalogDeepLinkPath()).toBe(MOVIE_PATH);
  });

  it('consumes and opens the pending catalog path once authenticated', () => {
    captureCatalogDeepLink(MOVIE_URL);
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    useCatalogDeepLinkNavigation();

    expect(push).toHaveBeenCalledWith(MOVIE_PATH);
    expect(trackProductMetric).toHaveBeenCalledWith(PRODUCT_METRICS.sharedContentLinkOpened);
    expect(peekPendingCatalogDeepLinkPath()).toBeNull();
  });

  it('does not consume a pending path while auth is still loading', () => {
    captureCatalogDeepLink(MOVIE_URL);
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    useCatalogDeepLinkNavigation();

    expect(push).not.toHaveBeenCalled();
    expect(peekPendingCatalogDeepLinkPath()).toBe(MOVIE_PATH);
  });

  it('still opens a warm link after login when the signed-out pass only peeked', () => {
    captureCatalogDeepLink(MOVIE_URL);
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    useCatalogDeepLinkNavigation();
    expect(peekPendingCatalogDeepLinkPath()).toBe(MOVIE_PATH);

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    useCatalogDeepLinkNavigation();

    expect(push).toHaveBeenCalledWith(MOVIE_PATH);
    expect(peekPendingCatalogDeepLinkPath()).toBeNull();
  });
});
