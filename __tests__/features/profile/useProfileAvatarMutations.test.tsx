import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import {
  useRemoveAvatarMutation,
  useUploadAvatarMutation,
} from '@/features/profile/hooks/useProfileMutations';
import { currentProfileQueryKey } from '@/features/profile/hooks/profile-query-keys';
import type { UserProfileResponse } from '@/features/profile/types';

const mockRefreshUser = jest.fn();
const mockUploadAvatar = jest.fn();
const mockRemoveAvatar = jest.fn();

jest.mock('@/auth/useAuth', () => ({
  useAuth: () => ({ refreshUser: mockRefreshUser }),
}));

jest.mock('@/features/profile/api/profile-api', () => ({
  uploadAvatar: (...args: unknown[]) => mockUploadAvatar(...args),
  removeAvatar: (...args: unknown[]) => mockRemoveAvatar(...args),
}));

const profileWithCustomAvatar: UserProfileResponse = {
  id: 'user-1',
  email: 'user@example.com',
  userName: 'user',
  displayName: 'User',
  createdAt: '2026-01-01T00:00:00Z',
  hasPassword: true,
  linkedProviders: [],
  effectiveAvatarUrl: 'https://cdn.example.com/custom.webp',
  avatarKind: 'custom',
};

const profileAfterRemove: UserProfileResponse = {
  ...profileWithCustomAvatar,
  effectiveAvatarUrl: 'https://google.example/photo.jpg',
  avatarKind: 'provider',
  customAvatarUrl: undefined,
  providerAvatarUrl: 'https://google.example/photo.jpg',
};

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('profile avatar mutations', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRefreshUser.mockResolvedValue(undefined);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { retry: false, gcTime: 0 },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('upload success updates profile cache and refreshes auth user', async () => {
    mockUploadAvatar.mockResolvedValue(profileWithCustomAvatar);
    const { result } = renderHook(() => useUploadAvatarMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync({
      uri: 'file:///avatar.jpg',
      name: 'avatar.jpg',
      type: 'image/jpeg',
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(currentProfileQueryKey())).toEqual(profileWithCustomAvatar);
    });
    expect(mockRefreshUser).toHaveBeenCalledTimes(1);
  });

  it('remove success updates profile cache and refreshes auth user', async () => {
    mockRemoveAvatar.mockResolvedValue(profileAfterRemove);
    const { result } = renderHook(() => useRemoveAvatarMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync();

    await waitFor(() => {
      expect(queryClient.getQueryData(currentProfileQueryKey())).toEqual(profileAfterRemove);
    });
    expect(mockRefreshUser).toHaveBeenCalledTimes(1);
  });
});
