jest.unmock('@/features/follows/services/push-device-service');

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: { extra: { eas: { projectId: 'test-project-id' } } },
  },
}));

jest.mock('expo-device', () => ({
  isDevice: true,
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  AndroidImportance: {
    DEFAULT: 3,
  },
}));

jest.mock('@/features/follows/api/push-devices-api', () => ({
  registerPushDevice: jest.fn(),
}));

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { registerPushDevice } from '@/features/follows/api/push-devices-api';
import {
  ensurePushDeviceRegisteredAsync,
  resetPushPermissionRequestState,
} from '@/features/follows/services/push-device-service';

describe('ensurePushDeviceRegisteredAsync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetPushPermissionRequestState();
    (Device.isDevice as boolean) = true;
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
      data: 'ExponentPushToken[abcdefghijklmnopqrstuvwxyz123456]',
    });
  });

  it('registers push device when permission is granted', async () => {
    const result = await ensurePushDeviceRegisteredAsync();

    expect(result).toBe('registered');
    expect(registerPushDevice).toHaveBeenCalledWith({
      expoPushToken: 'ExponentPushToken[abcdefghijklmnopqrstuvwxyz123456]',
      platform: 'ios',
    });
  });

  it('returns permission_denied without registering when permission is denied', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const result = await ensurePushDeviceRegisteredAsync();

    expect(result).toBe('permission_denied');
    expect(registerPushDevice).not.toHaveBeenCalled();
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('requests permission once when undetermined and does not request again', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const first = await ensurePushDeviceRegisteredAsync();
    const second = await ensurePushDeviceRegisteredAsync();

    expect(first).toBe('permission_denied');
    expect(second).toBe('permission_denied');
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });
});
