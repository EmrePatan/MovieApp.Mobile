import * as SecureStore from 'expo-secure-store';

const DISMISSED_KEY = 'notification_permission_prompt_dismissed';

export async function isNotificationPermissionPromptDismissed(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(DISMISSED_KEY);
  return value === 'true';
}

export async function markNotificationPermissionPromptDismissed(): Promise<void> {
  await SecureStore.setItemAsync(DISMISSED_KEY, 'true');
}

export async function clearNotificationPermissionPromptDismissed(): Promise<void> {
  await SecureStore.deleteItemAsync(DISMISSED_KEY);
}
