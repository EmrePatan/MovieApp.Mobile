import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { RegionalPreferenceProvider } from '@/features/regions/RegionalPreferenceProvider';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return <RegionalPreferenceProvider>{children}</RegionalPreferenceProvider>;
}

describe('RegionalPreferenceProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
  });

  it('hydrates saved preference before exposing region-sensitive state', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('US');

    const { result } = renderHook(() => useRegionalPreference(), { wrapper });

    await waitFor(() => {
      expect(result.current.isHydrated).toBe(true);
    });

    expect(result.current.region).toBe('US');
    expect(result.current.source).toBe('saved');
  });

  it('persists explicit settings changes', async () => {
    const { result } = renderHook(() => useRegionalPreference(), { wrapper });

    await waitFor(() => {
      expect(result.current.isHydrated).toBe(true);
    });

    await act(async () => {
      await result.current.setRegion('FR');
    });

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('movieapp.user_region', 'FR');
  });
});
