import * as SecureStore from 'expo-secure-store';
import {
  clearSavedUserRegion,
  getSavedUserRegion,
  saveUserRegion,
} from '@/features/regions/regional-preference-storage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('regional-preference-storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists explicit user region', async () => {
    await saveUserRegion('us');

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('movieapp.user_region', 'US');
  });

  it('reads saved user region', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('FR');

    await expect(getSavedUserRegion()).resolves.toBe('FR');
  });

  it('clears saved user region', async () => {
    await clearSavedUserRegion();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('movieapp.user_region');
  });
});
