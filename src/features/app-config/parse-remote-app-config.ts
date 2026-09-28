import {
  DEFAULT_REMOTE_APP_CONFIG,
  type PlatformVersionConfig,
  type RemoteAppConfig,
} from './types';

function parsePlatformVersion(value: unknown): PlatformVersionConfig | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const minimumBuild = Number(record.minimumBuild);
  const latestBuild = Number(record.latestBuild);
  const storeUrl = typeof record.storeUrl === 'string' ? record.storeUrl : '';

  if (
    !Number.isFinite(minimumBuild) ||
    !Number.isFinite(latestBuild) ||
    minimumBuild < 0 ||
    latestBuild < 0 ||
    latestBuild < minimumBuild
  ) {
    return null;
  }

  return {
    minimumBuild: Math.trunc(minimumBuild),
    latestBuild: Math.trunc(latestBuild),
    storeUrl,
  };
}

export function parseRemoteAppConfig(payload: unknown): RemoteAppConfig | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const root = payload as Record<string, unknown>;
  const maintenance = root.maintenance as Record<string, unknown> | undefined;
  const versions = root.versions as Record<string, unknown> | undefined;
  const features = root.features as Record<string, unknown> | undefined;

  if (!maintenance || !versions || !features) {
    return null;
  }

  const ios = parsePlatformVersion(versions.ios);
  const android = parsePlatformVersion(versions.android);

  if (!ios || !android) {
    return null;
  }

  return {
    maintenance: {
      enabled: maintenance.enabled === true,
    },
    versions: { ios, android },
    features: {
      aiRecommendations: features.aiRecommendations !== false,
      reviewTranslation: features.reviewTranslation !== false,
    },
  };
}

export function mergeWithDefaultRemoteAppConfig(config: RemoteAppConfig): RemoteAppConfig {
  return {
    maintenance: {
      enabled: config.maintenance.enabled === true,
    },
    versions: {
      ios: { ...DEFAULT_REMOTE_APP_CONFIG.versions.ios, ...config.versions.ios },
      android: { ...DEFAULT_REMOTE_APP_CONFIG.versions.android, ...config.versions.android },
    },
    features: {
      aiRecommendations: config.features.aiRecommendations !== false,
      reviewTranslation: config.features.reviewTranslation !== false,
    },
  };
}
