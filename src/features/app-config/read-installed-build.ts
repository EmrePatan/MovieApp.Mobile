import Constants from 'expo-constants';
import { Platform } from 'react-native';

function parsePositiveInteger(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value);
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  return null;
}

/**
 * Reads the installed native build identifier (iOS CFBundleVersion / Android versionCode).
 * Returns null when unavailable so enforcement fails open.
 */
export function readInstalledNativeBuild(): number | null {
  if (Platform.OS === 'ios') {
    const fromNativeManifest = Constants.platform?.ios?.buildNumber;
    const fromExpoConfig = Constants.expoConfig?.ios?.buildNumber;
    return parsePositiveInteger(fromNativeManifest ?? fromExpoConfig);
  }

  if (Platform.OS === 'android') {
    const fromNativeManifest = Constants.platform?.android?.versionCode;
    const fromExpoConfig = Constants.expoConfig?.android?.versionCode;
    return parsePositiveInteger(fromNativeManifest ?? fromExpoConfig);
  }

  return null;
}
