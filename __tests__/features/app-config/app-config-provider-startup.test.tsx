import { renderHook, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { AppConfigProvider } from '@/features/app-config/AppConfigProvider';
import { useAppConfig } from '@/features/app-config/hooks/useAppConfig';
import { fetchRemoteAppConfig } from '@/features/app-config/app-config-api';
import { DEFAULT_REMOTE_APP_CONFIG } from '@/features/app-config/types';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    platform: { ios: { buildNumber: '9' }, android: { versionCode: 2 } },
    expoConfig: { ios: { buildNumber: '9' }, android: { versionCode: 2 } },
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock('@/features/app-config/app-config-api', () => ({
  fetchRemoteAppConfig: jest.fn(),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return <AppConfigProvider>{children}</AppConfigProvider>;
}

describe('AppConfigProvider startup resilience', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves startup with defaults when SecureStore and remote config are unavailable', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('Keychain unavailable'));
    (fetchRemoteAppConfig as jest.Mock).mockRejectedValue(new Error('API unavailable'));

    const { result } = renderHook(() => useAppConfig(), { wrapper });

    await waitFor(() => {
      expect(result.current.isStartupResolved).toBe(true);
    });

    expect(result.current.config).toEqual(DEFAULT_REMOTE_APP_CONFIG);
  });

  it('applies remote config even when persisting its cache fails', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error('Keychain unavailable'));
    const remoteConfig = {
      ...DEFAULT_REMOTE_APP_CONFIG,
      features: { ...DEFAULT_REMOTE_APP_CONFIG.features, aiRecommendations: false },
    };
    (fetchRemoteAppConfig as jest.Mock).mockResolvedValue(remoteConfig);

    const { result } = renderHook(() => useAppConfig(), { wrapper });

    await waitFor(() => {
      expect(result.current.isStartupResolved).toBe(true);
    });

    expect(result.current.config).toEqual(remoteConfig);
  });
});
