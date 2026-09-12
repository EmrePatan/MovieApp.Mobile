import * as SecureStore from 'expo-secure-store';
import { getAccessToken, removeAccessToken, saveAccessToken } from '@/auth/auth-storage';

describe('auth storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores the access token in SecureStore', async () => {
    await saveAccessToken('jwt-token');

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('movieapp.access_token', 'jwt-token');
  });

  it('reads the access token from SecureStore', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('jwt-token');

    await expect(getAccessToken()).resolves.toBe('jwt-token');
  });

  it('removes the access token from SecureStore', async () => {
    await removeAccessToken();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('movieapp.access_token');
  });
});
