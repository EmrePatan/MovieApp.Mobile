import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpcomingCatalog } from '@/features/upcoming/hooks/useUpcomingCatalog';
import { useComingUpInitialTab } from '@/features/upcoming/hooks/useComingUpInitialTab';

jest.mock('@/features/upcoming/hooks/useUpcomingCatalog', () => ({
  useUpcomingCatalog: jest.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useComingUpInitialTab', () => {
  const setParams = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('selects Upcoming when personalized content is empty', async () => {
    (useUpcomingCatalog as jest.Mock).mockReturnValue({
      data: { pages: [{ items: [] }] },
      isLoading: false,
    });

    const { result } = renderHook(
      () =>
        useComingUpInitialTab({
          tabParam: undefined,
          isAuthenticated: true,
          router: { setParams },
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.activeTab).toBe('upcoming');
      expect(setParams).toHaveBeenCalledWith({ tab: 'upcoming' });
    });
  });

  it('selects For You when personalized content exists', async () => {
    (useUpcomingCatalog as jest.Mock).mockReturnValue({
      data: { pages: [{ items: [{ id: 'movie-1' }] }] },
      isLoading: false,
    });

    const { result } = renderHook(
      () =>
        useComingUpInitialTab({
          tabParam: undefined,
          isAuthenticated: true,
          router: { setParams },
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.activeTab).toBe('for-you');
      expect(setParams).toHaveBeenCalledWith({ tab: 'for-you' });
    });
  });
});
