import * as Linking from 'expo-linking';
import { useAuth } from '@/auth/useAuth';
import {
  captureCatalogDeepLink,
  peekPendingCatalogDeepLinkPath,
  resetPendingCatalogDeepLinkForTests,
} from '@/auth/pending-catalog-deep-link';
import { useCatalogDeepLinkNavigation } from '@/hooks/useCatalogDeepLinkNavigation';

jest.mock('@/auth/useAuth');
jest.mock('@/features/metrics/track-product-metric', () => ({
  trackProductMetric: jest.fn(),
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const movieUrl = `https://moviecaveapp.com/movie/${movieId}`;

describe('useCatalogDeepLinkNavigation', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    resetPendingCatalogDeepLinkForTests();
    const expoRouter = jest.requireMock('expo-router');
    expoRouter.useRouter.mockReturnValue({ push, replace: jest.fn() });
  });

  it('keeps a signed-out catalog link queued instead of dropping it', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    let listener: ((event: { url: string }) => void) | undefined;
    (Linking.addEventListener as jest.Mock).mockImplementation((_event: string, callback: (event: { url: string }) => void) => {
      listener = callback;
      return { remove: jest.fn() };
    });

    useCatalogDeepLinkNavigation();
    listener?.({ url: movieUrl });

    expect(push).not.toHaveBeenCalled();
    expect(peekPendingCatalogDeepLinkPath()).toBe(`/movie/${movieId}`);
  });

  it('opens a signed-in warm link once and clears the queued path', () => {
    captureCatalogDeepLink(movieUrl);
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    let listener: ((event: { url: string }) => void) | undefined;
    (Linking.addEventListener as jest.Mock).mockImplementation((_event: string, callback: (event: { url: string }) => void) => {
      listener = callback;
      return { remove: jest.fn() };
    });

    useCatalogDeepLinkNavigation();
    listener?.({ url: movieUrl });

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith(`/movie/${movieId}`);
    expect(peekPendingCatalogDeepLinkPath()).toBeNull();
  });
});
