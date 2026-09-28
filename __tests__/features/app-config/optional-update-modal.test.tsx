import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { OptionalUpdateModal } from '@/features/app-config/components/OptionalUpdateModal';
import { saveOptionalUpdateDismissal } from '@/features/app-config/optional-update-dismissal-storage';
import type { AppConfigEvaluation } from '@/features/app-config/types';

const mockOpenURL = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-linking', () => ({
  openURL: (...args: unknown[]) => mockOpenURL(...args),
}));

let mockPathname = '/home';

jest.mock('expo-router', () => ({
  usePathname: () => mockPathname,
}));

const mockSuppressOptionalUpdateForSession = jest.fn();
let mockEvaluation: AppConfigEvaluation = {
  blocking: 'none',
  updatePrompt: 'optional',
  storeUrl: 'https://apps.apple.com/app/id6814454427',
};
let mockSessionSuppressed = false;

jest.mock('@/features/app-config/hooks/useAppConfig', () => ({
  useAppConfig: () => ({
    isStartupResolved: true,
    blocking: 'none',
    evaluation: mockEvaluation,
    config: {
      maintenance: { enabled: false },
      versions: {
        ios: {
          minimumBuild: 9,
          latestBuild: 12,
          storeUrl: 'https://apps.apple.com/app/id6814454427',
        },
        android: {
          minimumBuild: 2,
          latestBuild: 4,
          storeUrl: 'https://play.google.com/store/apps/details?id=com.movieapp.mobile',
        },
      },
      features: { aiRecommendations: true, reviewTranslation: true },
    },
    refreshConfig: jest.fn(),
    isRefreshing: false,
    suppressOptionalUpdateForSession: () => {
      mockSuppressOptionalUpdateForSession();
      mockSessionSuppressed = true;
    },
    optionalUpdateSessionSuppressed: mockSessionSuppressed,
  }),
}));

jest.mock('@/features/app-config/optional-update-dismissal-storage', () => ({
  loadOptionalUpdateDismissal: jest.fn().mockResolvedValue(null),
  saveOptionalUpdateDismissal: jest.fn().mockResolvedValue(undefined),
  shouldShowOptionalUpdateAfterDismissal: jest.fn(() => true),
  OPTIONAL_UPDATE_REMINDER_MS: 24 * 60 * 60 * 1000,
}));

describe('OptionalUpdateModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = '/home';
    mockSessionSuppressed = false;
    mockEvaluation = {
      blocking: 'none',
      updatePrompt: 'optional',
      storeUrl: 'https://apps.apple.com/app/id6814454427',
    };
    mockOpenURL.mockClear();
  });

  it('opens when optional update is eligible', async () => {
    render(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.getByText('New version available')).toBeTruthy();
    });
    expect(mockSuppressOptionalUpdateForSession).not.toHaveBeenCalled();
  });

  it('stays visible after session suppression flips while already open', async () => {
    const view = render(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.getByText('New version available')).toBeTruthy();
    });

    mockSessionSuppressed = true;
    view.rerender(<OptionalUpdateModal />);

    expect(screen.getByText('New version available')).toBeTruthy();
  });

  it('persists Later dismissal and suppresses session when X is pressed', async () => {
    render(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.getByLabelText('Dismiss new version notice')).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText('Dismiss new version notice'));

    await waitFor(() => {
      expect(screen.queryByText('New version available')).toBeNull();
    });

    expect(saveOptionalUpdateDismissal).toHaveBeenCalledWith(12);
    expect(mockSuppressOptionalUpdateForSession).toHaveBeenCalledTimes(1);
  });

  it('does not reopen in the same session after X', async () => {
    const view = render(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.getByText('New version available')).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText('Dismiss new version notice'));

    await waitFor(() => {
      expect(screen.queryByText('New version available')).toBeNull();
    });

    view.rerender(<OptionalUpdateModal />);

    expect(screen.queryByText('New version available')).toBeNull();
  });

  it('opens store, hides banner, and suppresses session without 24h persistence on Update', async () => {
    render(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.getByLabelText('Update Movie Cave from the store')).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText('Update Movie Cave from the store'));

    expect(mockOpenURL).toHaveBeenCalledWith('https://apps.apple.com/app/id6814454427');
    expect(mockSuppressOptionalUpdateForSession).toHaveBeenCalledTimes(1);
    expect(saveOptionalUpdateDismissal).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByText('New version available')).toBeNull();
    });
  });

  it('hides for the session on navigation without 24h persistence', async () => {
    const view = render(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.getByText('New version available')).toBeTruthy();
    });

    mockPathname = '/discover';
    view.rerender(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.queryByText('New version available')).toBeNull();
    });

    expect(mockSuppressOptionalUpdateForSession).toHaveBeenCalledTimes(1);
    expect(saveOptionalUpdateDismissal).not.toHaveBeenCalled();
  });

  it('can show again when session is fresh and no Later dismissal exists', async () => {
    const view = render(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.getByText('New version available')).toBeTruthy();
    });

    mockPathname = '/discover';
    view.rerender(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.queryByText('New version available')).toBeNull();
    });

    mockSessionSuppressed = false;
    mockPathname = '/home';
    view.rerender(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.getByText('New version available')).toBeTruthy();
    });
  });

  it('closes when evaluation changes away from optional', async () => {
    const view = render(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.getByText('New version available')).toBeTruthy();
    });

    mockEvaluation = {
      blocking: 'none',
      updatePrompt: 'none',
      storeUrl: 'https://apps.apple.com/app/id6814454427',
    };
    view.rerender(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.queryByText('New version available')).toBeNull();
    });
  });

  it('closes when store URL becomes unavailable', async () => {
    const view = render(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.getByText('New version available')).toBeTruthy();
    });

    mockEvaluation = {
      blocking: 'none',
      updatePrompt: 'optional',
      storeUrl: null,
    };
    view.rerender(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.queryByText('New version available')).toBeNull();
    });
  });

  it('does not open under forced update evaluation', async () => {
    mockEvaluation = {
      blocking: 'forced',
      updatePrompt: 'none',
      storeUrl: 'https://apps.apple.com/app/id6814454427',
    };

    render(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.queryByText('New version available')).toBeNull();
    });
  });

  it('does not open under maintenance evaluation', async () => {
    mockEvaluation = {
      blocking: 'maintenance',
      updatePrompt: 'none',
      storeUrl: 'https://apps.apple.com/app/id6814454427',
    };

    render(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.queryByText('New version available')).toBeNull();
    });
  });
});
