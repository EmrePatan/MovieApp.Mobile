import React from 'react';
import { Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { FollowButton } from '@/features/follows/components/FollowButton';
import { useTvShowFollowStatus } from '@/features/follows/hooks/useTvShowFollowStatus';
import {
  useCreateTvShowFollow,
  useRemoveTvShowFollow,
  useUpdateTvShowFollow,
} from '@/features/follows/hooks/useTvShowFollowMutations';
import { ensurePushDeviceRegisteredAsync } from '@/features/follows/services/push-device-service';
import {
  getNotificationPermissionState,
  openNotificationSettingsAsync,
  requestNotificationPermissionAsync,
} from '@/features/follows/services/notification-permission-service';
import { isNotificationPermissionPromptDismissed } from '@/features/follows/services/notification-permission-prompt-storage';
import { changeUiLanguage, i18n } from '@/i18n';

const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
const mockRequireAuth = jest.fn(() => true);
const mockCreateMutate = jest.fn();
const mockUpdateMutate = jest.fn();
const mockRemoveMutate = jest.fn();

jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isAuthenticated: true,
    requireAuth: mockRequireAuth,
  }),
}));

jest.mock('@/features/follows/hooks/useTvShowFollowStatus', () => ({
  useTvShowFollowStatus: jest.fn(),
}));

jest.mock('@/features/follows/hooks/useTvShowFollowMutations', () => ({
  useCreateTvShowFollow: jest.fn(),
  useRemoveTvShowFollow: jest.fn(),
  useUpdateTvShowFollow: jest.fn(),
}));

jest.mock('@/features/follows/services/push-device-service', () => ({
  ensurePushDeviceRegisteredAsync: jest.fn(),
}));

jest.mock('@/features/follows/services/notification-permission-service', () => ({
  getNotificationPermissionState: jest.fn(),
  requestNotificationPermissionAsync: jest.fn(),
  openNotificationSettingsAsync: jest.fn(),
}));

jest.mock('@/features/follows/services/notification-permission-prompt-storage', () => ({
  isNotificationPermissionPromptDismissed: jest.fn(),
  markNotificationPermissionPromptDismissed: jest.fn(),
}));

jest.mock('@/features/follows/utils/verify-follow-mutation-outcome', () => ({
  verifyTvShowUnfollowed: jest.fn().mockResolvedValue(false),
  verifyTvShowFollowPreferences: jest.fn().mockResolvedValue(false),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

function renderFollowButton() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <FollowButton tvShowId={tvShowId} />
      </I18nextProvider>
    </QueryClientProvider>,
  );
}

function mockNotFollowingStatus() {
  (useTvShowFollowStatus as jest.Mock).mockReturnValue({
    data: {
      isFollowing: false,
      notifyNewSeasons: true,
      notifyNewEpisodes: true,
      baselineEstablished: false,
    },
    isLoading: false,
  });
}

describe.each(['android', 'ios'] as const)('FollowButton platform parity (%s)', (platform) => {
  const originalPlatform = Platform.OS;

  beforeEach(async () => {
    Platform.OS = platform;
    jest.clearAllMocks();
    await changeUiLanguage('en');
    (useCreateTvShowFollow as jest.Mock).mockReturnValue({
      mutate: mockCreateMutate,
      mutateAsync: mockCreateMutate,
      isPending: false,
    });
    (useUpdateTvShowFollow as jest.Mock).mockReturnValue({
      mutate: mockUpdateMutate,
      mutateAsync: mockUpdateMutate,
      isPending: false,
    });
    (useRemoveTvShowFollow as jest.Mock).mockReturnValue({
      mutate: mockRemoveMutate,
      mutateAsync: mockRemoveMutate,
      isPending: false,
    });
    (ensurePushDeviceRegisteredAsync as jest.Mock).mockResolvedValue('registered');
    (getNotificationPermissionState as jest.Mock).mockResolvedValue('granted');
    (isNotificationPermissionPromptDismissed as jest.Mock).mockResolvedValue(false);
    mockNotFollowingStatus();
  });

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  it('updates selected state without generic follow-success feedback', async () => {
    const status = {
      isFollowing: false,
      notifyNewSeasons: true,
      notifyNewEpisodes: true,
      baselineEstablished: false,
    };

    (useTvShowFollowStatus as jest.Mock).mockImplementation(() => ({
      data: status,
      isLoading: false,
    }));

    mockCreateMutate.mockImplementation(async () => {
      status.isFollowing = true;
      status.baselineEstablished = true;
    });

    const { rerender } = renderFollowButton();
    fireEvent.press(screen.getByLabelText('Follow this show'));
    fireEvent.press(screen.getByText('Follow show'));
    rerender(
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
          })
        }
      >
        <I18nextProvider i18n={i18n}>
          <FollowButton tvShowId={tvShowId} />
        </I18nextProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Manage follow').props.accessibilityState?.selected).toBe(true);
    });
    expect(screen.queryByText('Following')).toBeNull();
    expect(
      screen.queryByText(
        'Followed. Enable notifications in device settings to receive release alerts.',
      ),
    ).toBeNull();
  });

  it('opens the notification permission prompt when permission is requestable', async () => {
    (getNotificationPermissionState as jest.Mock).mockResolvedValue('requestable');
    mockCreateMutate.mockResolvedValue(undefined);

    renderFollowButton();
    fireEvent.press(screen.getByLabelText('Follow this show'));
    await act(async () => {
      fireEvent.press(screen.getByText('Follow show'));
    });

    expect(
      await screen.findByText(
        'Allow notifications so we can alert you about new episodes and releases.',
        {},
        { timeout: 3000 },
      ),
    ).toBeTruthy();
    expect(screen.getByText('Not now')).toBeTruthy();
    expect(screen.getByLabelText('Enable notifications')).toBeTruthy();
  });

  it('routes settings-required permission flow through open settings', async () => {
    (getNotificationPermissionState as jest.Mock).mockResolvedValue('settings_required');
    mockCreateMutate.mockResolvedValue(undefined);

    renderFollowButton();
    fireEvent.press(screen.getByLabelText('Follow this show'));
    await act(async () => {
      fireEvent.press(screen.getByText('Follow show'));
    });

    expect(await screen.findByText('Open settings')).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Open settings'));
    });
    expect(openNotificationSettingsAsync).toHaveBeenCalledTimes(1);
  });

  it('keeps follow failure feedback in the preferences modal', async () => {
    mockCreateMutate.mockRejectedValue(new Error('Network error'));

    renderFollowButton();
    fireEvent.press(screen.getByLabelText('Follow this show'));
    fireEvent.press(screen.getByText('Follow show'));

    await waitFor(() =>
      expect(screen.getByText('Could not follow this show. Please try again.')).toBeTruthy(),
    );
    expect(screen.queryByText('Following')).toBeNull();
  });
});

describe.each(['android', 'ios'] as const)(
  'FollowButton Turkish follow-success parity (%s)',
  (platform) => {
    const originalPlatform = Platform.OS;

    beforeEach(async () => {
      Platform.OS = platform;
      jest.clearAllMocks();
      await changeUiLanguage('tr');
      (useCreateTvShowFollow as jest.Mock).mockReturnValue({
        mutate: mockCreateMutate,
        mutateAsync: mockCreateMutate,
        isPending: false,
      });
      (useUpdateTvShowFollow as jest.Mock).mockReturnValue({
        mutate: mockUpdateMutate,
        mutateAsync: mockUpdateMutate,
        isPending: false,
      });
      (useRemoveTvShowFollow as jest.Mock).mockReturnValue({
        mutate: mockRemoveMutate,
        mutateAsync: mockRemoveMutate,
        isPending: false,
      });
      (getNotificationPermissionState as jest.Mock).mockResolvedValue('requestable');
      mockNotFollowingStatus();
    });

    afterEach(() => {
      Platform.OS = originalPlatform;
    });

    it('does not render Takip edildi success feedback after follow', async () => {
      mockCreateMutate.mockResolvedValue(undefined);

      renderFollowButton();
      fireEvent.press(screen.getByLabelText('Bu diziyi takip et'));
      await act(async () => {
        fireEvent.press(screen.getByText('Diziyi takip et'));
      });

      expect(screen.queryByText('Takip edildi')).toBeNull();
      expect(
        screen.queryByText(
          'Takip edildi. Yayın uyarıları almak için cihaz ayarlarından bildirimleri etkinleştir.',
        ),
      ).toBeNull();
      expect(screen.getByText('Şimdi değil')).toBeTruthy();
      expect(screen.getByLabelText('Bildirimleri aç')).toBeTruthy();
    });
  },
);
