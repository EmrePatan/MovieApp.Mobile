import { Platform } from 'react-native';
import { resolveStoreUrlForPlatform } from './store-urls';
import type { AppConfigEvaluation, RemoteAppConfig } from './types';

function getPlatformVersions(config: RemoteAppConfig) {
  return Platform.OS === 'ios' ? config.versions.ios : config.versions.android;
}

export function evaluateAppConfig(
  installedBuild: number | null,
  config: RemoteAppConfig,
): AppConfigEvaluation {
  const storeUrl = resolveStoreUrlForPlatform(config);

  if (config.maintenance.enabled) {
    return {
      blocking: 'maintenance',
      updatePrompt: 'none',
      storeUrl,
    };
  }

  if (installedBuild === null) {
    return {
      blocking: 'none',
      updatePrompt: 'none',
      storeUrl,
    };
  }

  const { minimumBuild, latestBuild } = getPlatformVersions(config);

  if (installedBuild < minimumBuild) {
    return {
      blocking: 'forced',
      updatePrompt: 'none',
      storeUrl,
    };
  }

  if (installedBuild < latestBuild) {
    return {
      blocking: 'none',
      updatePrompt: 'optional',
      storeUrl,
    };
  }

  return {
    blocking: 'none',
    updatePrompt: 'none',
    storeUrl,
  };
}

export function evaluateCachedBlockingOnly(
  installedBuild: number | null,
  config: RemoteAppConfig,
): AppConfigEvaluation['blocking'] {
  if (config.maintenance.enabled) {
    return 'maintenance';
  }

  if (installedBuild === null) {
    return 'none';
  }

  const { minimumBuild } = getPlatformVersions(config);
  if (installedBuild < minimumBuild) {
    return 'forced';
  }

  return 'none';
}
