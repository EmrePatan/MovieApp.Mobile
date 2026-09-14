import { api } from '@/api/client';
import { buildPushDevicesPath } from './routes';
import type { RegisterPushDeviceRequest, UnregisterPushDeviceRequest } from '../types';

export async function registerPushDevice(request: RegisterPushDeviceRequest): Promise<void> {
  await api.put<void>(buildPushDevicesPath(), request);
}

export async function unregisterPushDevice(expoPushToken: string): Promise<void> {
  const request: UnregisterPushDeviceRequest = { expoPushToken };
  await api.delete<void>(buildPushDevicesPath(), request);
}
