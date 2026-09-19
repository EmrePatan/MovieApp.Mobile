import { Animated, Text } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AppStartupGate } from '@/bootstrap/AppStartupGate';
import { MIN_BRANDED_SPLASH_MS } from '@/bootstrap/startup-splash-timing';
import { useAuth } from '@/auth/useAuth';
import * as startupReadiness from '@/bootstrap/startup-readiness';

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

const mockHideAsync = jest.fn().mockResolvedValue(undefined);
const mockPreventAutoHideAsync = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-router', () => ({
  SplashScreen: {
    preventAutoHideAsync: (...args: unknown[]) => mockPreventAutoHideAsync(...args),
    hideAsync: (...args: unknown[]) => mockHideAsync(...args),
  },
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/bootstrap/startup-readiness', () => {
  const actual = jest.requireActual<typeof import('@/bootstrap/startup-readiness')>(
    '@/bootstrap/startup-readiness',
  );

  return {
    ...actual,
    preloadStartupIconFonts: jest.fn(actual.preloadStartupIconFonts),
  };
});

function triggerBrandedSplashLayout() {
  fireEvent(screen.getByTestId('branded-startup-splash'), 'layout');
}

async function revealApplicationUi() {
  await act(async () => {
    jest.advanceTimersByTime(MIN_BRANDED_SPLASH_MS);
    await Promise.resolve();
  });
}

describe('AppStartupGate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    jest.spyOn(Animated, 'timing').mockImplementation((value, config) => ({
      start: (callback?: (result: { finished: boolean }) => void) => {
        if (typeof config?.toValue === 'number') {
          value.setValue(config.toValue);
        }

        callback?.({ finished: true });
        return { stop: jest.fn(), reset: jest.fn() };
      },
      stop: jest.fn(),
      reset: jest.fn(),
    }));

    (useAuth as jest.Mock).mockReturnValue({ isLoading: true });
    (startupReadiness.preloadStartupIconFonts as jest.Mock).mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('shows branded splash while startup resources initialize', async () => {
    render(
      <AppStartupGate>
        <Text>app-ready</Text>
      </AppStartupGate>,
    );

    expect(screen.getByTestId('branded-startup-splash')).toBeTruthy();
    expect(screen.queryByText('app-ready')).toBeNull();
    expect(mockHideAsync).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(startupReadiness.preloadStartupIconFonts).toHaveBeenCalledTimes(1);
    });

    triggerBrandedSplashLayout();
    expect(mockHideAsync).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('app-ready')).toBeNull();
  });

  it('reveals application UI after startup readiness and minimum splash duration', async () => {
    const view = render(
      <AppStartupGate>
        <Text>app-ready</Text>
      </AppStartupGate>,
    );

    triggerBrandedSplashLayout();

    (useAuth as jest.Mock).mockReturnValue({ isLoading: false });
    view.rerender(
      <AppStartupGate>
        <Text>app-ready</Text>
      </AppStartupGate>,
    );

    expect(screen.queryByText('app-ready')).toBeNull();

    await revealApplicationUi();

    await waitFor(() => {
      expect(screen.getByText('app-ready')).toBeTruthy();
    });

    expect(mockHideAsync).toHaveBeenCalledTimes(1);
  });

  it('reveals application UI after font preload failure so startup cannot hang', async () => {
    (startupReadiness.preloadStartupIconFonts as jest.Mock).mockResolvedValue({
      ok: false,
      error: new Error('font load failed'),
    });
    (useAuth as jest.Mock).mockReturnValue({ isLoading: false });

    render(
      <AppStartupGate>
        <Text>app-ready</Text>
      </AppStartupGate>,
    );

    triggerBrandedSplashLayout();
    await revealApplicationUi();

    await waitFor(() => {
      expect(screen.getByText('app-ready')).toBeTruthy();
      expect(mockHideAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('hides native splash only once', async () => {
    (useAuth as jest.Mock).mockReturnValue({ isLoading: false });

    const view = render(
      <AppStartupGate>
        <Text>app-ready</Text>
      </AppStartupGate>,
    );

    triggerBrandedSplashLayout();
    triggerBrandedSplashLayout();

    await revealApplicationUi();

    await waitFor(() => {
      expect(screen.getByText('app-ready')).toBeTruthy();
    });

    await act(async () => {
      view.rerender(
        <AppStartupGate>
          <Text>app-ready</Text>
        </AppStartupGate>,
      );
    });

    expect(mockHideAsync).toHaveBeenCalledTimes(1);
  });
});
