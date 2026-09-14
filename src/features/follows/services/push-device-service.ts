import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { registerPushDevice, unregisterPushDevice } from '../api/push-devices-api';
import type { PushRegistrationResult } from '../types';

let lastRegisteredExpoPushToken: string | null = null;
let permissionRequestAttempted = false;

export function getLastRegisteredExpoPushToken(): string | null {
  return lastRegisteredExpoPushToken;
}

export function resetPushPermissionRequestState(): void {
  permissionRequestAttempted = false;
}

export async function ensurePushDeviceRegisteredAsync(): Promise<PushRegistrationResult> {
  if (!Device.isDevice) {
    return 'unavailable';
  }

  const permission = await Notifications.getPermissionsAsync();
  let finalStatus = permission.status;

  if (finalStatus === 'undetermined' && !permissionRequestAttempted) {
    permissionRequestAttempted = true;
    const requested = await Notifications.requestPermissionsAsync();
    finalStatus = requested.status;
  }

  if (finalStatus !== 'granted') {
    return 'permission_denied';
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  const tokenResponse = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );

  await registerPushDevice({
    expoPushToken: tokenResponse.data,
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
  });

  lastRegisteredExpoPushToken = tokenResponse.data;
  return 'registered';
}

export async function unregisterKnownPushDeviceAsync(): Promise<void> {
  if (!lastRegisteredExpoPushToken) {
    return;
  }

  try {
    await unregisterPushDevice(lastRegisteredExpoPushToken);
  } catch {
    // Logout must not fail when unregister is unavailable.
  } finally {
    lastRegisteredExpoPushToken = null;
  }
}
