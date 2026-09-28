import {
  evaluateAppConfig,
  evaluateCachedBlockingOnly,
} from '@/features/app-config/evaluate-app-config';
import type { RemoteAppConfig } from '@/features/app-config/types';

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

const baseConfig: RemoteAppConfig = {
  maintenance: { enabled: false },
  versions: {
    ios: {
      minimumBuild: 9,
      latestBuild: 12,
      storeUrl: 'https://apps.apple.com/app/id6814454427',
    },
    android: {
      minimumBuild: 2,
      latestBuild: 4,
      storeUrl: 'https://play.google.com/store/apps/details?id=com.movieapp.mobile',
    },
  },
  features: {
    aiRecommendations: true,
    reviewTranslation: true,
  },
};

describe('evaluateAppConfig', () => {
  it('prioritizes maintenance over forced update', () => {
    const result = evaluateAppConfig(5, {
      ...baseConfig,
      maintenance: { enabled: true },
    });

    expect(result.blocking).toBe('maintenance');
    expect(result.updatePrompt).toBe('none');
  });

  it('forces update when installed build is below minimum', () => {
    const result = evaluateAppConfig(8, baseConfig);
    expect(result.blocking).toBe('forced');
    expect(result.updatePrompt).toBe('none');
  });

  it('shows optional update when installed is between minimum and latest', () => {
    const result = evaluateAppConfig(10, baseConfig);
    expect(result.blocking).toBe('none');
    expect(result.updatePrompt).toBe('optional');
  });

  it('shows no update UI when installed meets latest', () => {
    const result = evaluateAppConfig(12, baseConfig);
    expect(result.blocking).toBe('none');
    expect(result.updatePrompt).toBe('none');
  });

  it('fails open when installed build cannot be read', () => {
    const result = evaluateAppConfig(null, baseConfig);
    expect(result.blocking).toBe('none');
    expect(result.updatePrompt).toBe('none');
  });
});

describe('evaluateCachedBlockingOnly', () => {
  it('returns forced when cached minimum exceeds installed build', () => {
    expect(evaluateCachedBlockingOnly(8, baseConfig)).toBe('forced');
  });
});
