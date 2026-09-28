import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { OptionalUpdateModal } from '@/features/app-config/components/OptionalUpdateModal';

const mockOpenURL = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-linking', () => ({
  openURL: (...args: unknown[]) => mockOpenURL(...args),
}));
import type { AppConfigEvaluation } from '@/features/app-config/types';

const mockMarkOptionalUpdateShownThisSession = jest.fn();
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
    markOptionalUpdateShownThisSession: mockMarkOptionalUpdateShownThisSession,
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
    mockSessionSuppressed = false;
    mockEvaluation = {
      blocking: 'none',
      updatePrompt: 'optional',
      storeUrl: 'https://apps.apple.com/app/id6814454427',
    };
    mockOpenURL.mockClear();
  });

  it('opens when optional update is available', async () => {
    render(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.getByText('New version available')).toBeTruthy();
    });
    expect(mockMarkOptionalUpdateShownThisSession).toHaveBeenCalledTimes(1);
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

  it('closes when the close button is pressed', async () => {
    render(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.getByLabelText('Dismiss new version notice')).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText('Dismiss new version notice'));

    await waitFor(() => {
      expect(screen.queryByText('New version available')).toBeNull();
    });
  });

  it('does not reopen in the same session after dismiss', async () => {
    const view = render(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.getByText('New version available')).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText('Dismiss new version notice'));

    await waitFor(() => {
      expect(screen.queryByText('New version available')).toBeNull();
    });

    mockSessionSuppressed = false;
    view.rerender(<OptionalUpdateModal />);

    expect(screen.queryByText('New version available')).toBeNull();
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

  it('opens store URL and closes when update is pressed', async () => {
    render(<OptionalUpdateModal />);

    await waitFor(() => {
      expect(screen.getByLabelText('Update Movie Cave from the store')).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText('Update Movie Cave from the store'));

    expect(mockOpenURL).toHaveBeenCalledWith('https://apps.apple.com/app/id6814454427');

    await waitFor(() => {
      expect(screen.queryByText('New version available')).toBeNull();
    });
  });
});
