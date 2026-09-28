export interface RemoteAppConfig {
  maintenance: {
    enabled: boolean;
  };
  versions: {
    ios: PlatformVersionConfig;
    android: PlatformVersionConfig;
  };
  features: {
    aiRecommendations: boolean;
    reviewTranslation: boolean;
  };
}

export interface PlatformVersionConfig {
  minimumBuild: number;
  latestBuild: number;
  storeUrl: string;
}

export type StartupBlockingKind = 'none' | 'maintenance' | 'forced';

export type UpdatePromptKind = 'none' | 'optional';

export interface AppConfigEvaluation {
  blocking: StartupBlockingKind;
  updatePrompt: UpdatePromptKind;
  storeUrl: string | null;
}

export interface CachedAppConfigRecord {
  config: RemoteAppConfig;
  fetchedAt: number;
}

export const DEFAULT_REMOTE_APP_CONFIG: RemoteAppConfig = {
  maintenance: { enabled: false },
  versions: {
    ios: {
      minimumBuild: 0,
      latestBuild: 0,
      storeUrl: 'https://apps.apple.com/app/id6814454427',
    },
    android: {
      minimumBuild: 0,
      latestBuild: 0,
      storeUrl: 'https://play.google.com/store/apps/details?id=com.movieapp.mobile',
    },
  },
  features: {
    aiRecommendations: true,
    reviewTranslation: true,
  },
};
