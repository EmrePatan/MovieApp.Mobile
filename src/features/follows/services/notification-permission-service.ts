import { Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export type NotificationPermissionState =
  | 'granted'
  | 'requestable'
  | 'settings_required';

export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  const permission = await Notifications.getPermissionsAsync();

  if (permission.granted || permission.status === 'granted') {
    return 'granted';
  }

  if (permission.canAskAgain !== false && permission.status === 'undetermined') {
    return 'requestable';
  }

  if (permission.canAskAgain !== false && permission.status === 'denied') {
    return 'requestable';
  }

  return 'settings_required';
}

export async function requestNotificationPermissionAsync(): Promise<boolean> {
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted || requested.status === 'granted';
}

export async function openNotificationSettingsAsync(): Promise<void> {
  if (Platform.OS === 'ios') {
    await Linking.openSettings();
    return;
  }

  await Linking.openSettings();
}
