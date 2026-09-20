import * as SecureStore from 'expo-secure-store';

const EXPO_PUSH_TOKEN_KEY = 'movieapp.expo_push_token';

export async function saveRegisteredExpoPushToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(EXPO_PUSH_TOKEN_KEY, token);
}

export async function getStoredExpoPushToken(): Promise<string | null> {
  return SecureStore.getItemAsync(EXPO_PUSH_TOKEN_KEY);
}

export async function clearStoredExpoPushToken(): Promise<void> {
  await SecureStore.deleteItemAsync(EXPO_PUSH_TOKEN_KEY);
}
