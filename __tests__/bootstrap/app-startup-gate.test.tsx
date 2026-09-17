import { Text } from 'react-native';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import { AppStartupGate } from '@/bootstrap/AppStartupGate';
import { useAuth } from '@/auth/useAuth';
import * as startupReadiness from '@/bootstrap/startup-readiness';

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

describe('AppStartupGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ isLoading: true });
    (startupReadiness.preloadStartupIconFonts as jest.Mock).mockResolvedValue({ ok: true });
  });

  it('keeps application UI hidden until icon fonts and auth bootstrap are ready', async () => {
    const view = render(
      <AppStartupGate>
        <Text>app-ready</Text>
      </AppStartupGate>,
    );

    expect(screen.queryByText('app-ready')).toBeNull();
    expect(mockHideAsync).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(startupReadiness.preloadStartupIconFonts).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByText('app-ready')).toBeNull();

    (useAuth as jest.Mock).mockReturnValue({ isLoading: false });
    view.rerender(
      <AppStartupGate>
        <Text>app-ready</Text>
      </AppStartupGate>,
    );

    await waitFor(() => {
      expect(screen.getByText('app-ready')).toBeTruthy();
    });

    await waitFor(() => {
      expect(mockHideAsync).toHaveBeenCalledTimes(1);
    });
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

    await waitFor(() => {
      expect(screen.getByText('app-ready')).toBeTruthy();
      expect(mockHideAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('hides splash only once', async () => {
    (useAuth as jest.Mock).mockReturnValue({ isLoading: false });

    const view = render(
      <AppStartupGate>
        <Text>app-ready</Text>
      </AppStartupGate>,
    );

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
