import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { getUiFormatLocaleTag } from '@/i18n';
import { registerPushDevice, unregisterPushDevice } from '../api/push-devices-api';
import type { PushRegistrationResult } from '../types';
import {
  clearStoredExpoPushToken,
  getStoredExpoPushToken,
  saveRegisteredExpoPushToken,
} from './push-device-storage';

let lastRegisteredExpoPushToken: string | null = null;
let permissionRequestAttempted = false;

export function getLastRegisteredExpoPushToken(): string | null {
  return lastRegisteredExpoPushToken;
}

export function resetPushPermissionRequestState(): void {
  permissionRequestAttempted = false;
  lastRegisteredExpoPushToken = null;
}

interface EnsurePushDeviceRegisteredOptions {
  allowPermissionRequest?: boolean;
}

function getExpoProjectId(): string | undefined {
  return Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
}

async function fetchExpoPushTokenAsync(): Promise<string> {
  const projectId = getExpoProjectId();
  const tokenResponse = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );
  return tokenResponse.data;
}

async function resolveExpoPushTokenForUnregister(): Promise<string | null> {
  if (lastRegisteredExpoPushToken) {
    return lastRegisteredExpoPushToken;
  }

  const storedToken = await getStoredExpoPushToken();
  if (storedToken) {
    return storedToken;
  }

  if (!Device.isDevice) {
    return null;
  }

  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== 'granted') {
    return null;
  }

  try {
    return await fetchExpoPushTokenAsync();
  } catch {
    return null;
  }
}

export async function ensurePushDeviceRegisteredAsync(
  options: EnsurePushDeviceRegisteredOptions = {},
): Promise<PushRegistrationResult> {
  const allowPermissionRequest = options.allowPermissionRequest ?? true;

  if (!Device.isDevice) {
    return 'unavailable';
  }

  const permission = await Notifications.getPermissionsAsync();
  let finalStatus = permission.status;

  if (finalStatus === 'undetermined' && allowPermissionRequest && !permissionRequestAttempted) {
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

  const expoPushToken = await fetchExpoPushTokenAsync();

  await registerPushDevice({
    expoPushToken,
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
    contentLocale: getUiFormatLocaleTag(),
  });

  lastRegisteredExpoPushToken = expoPushToken;
  await saveRegisteredExpoPushToken(expoPushToken);
  return 'registered';
}

export async function forgetKnownPushDeviceAsync(): Promise<void> {
  lastRegisteredExpoPushToken = null;
  await clearStoredExpoPushToken();
}

export async function unregisterKnownPushDeviceAsync(): Promise<void> {
  const token = await resolveExpoPushTokenForUnregister();
  if (!token) {
    return;
  }

  try {
    await unregisterPushDevice(token);
  } catch {
    // Logout must not fail when unregister is unavailable.
  } finally {
    lastRegisteredExpoPushToken = null;
    await clearStoredExpoPushToken();
  }
}
