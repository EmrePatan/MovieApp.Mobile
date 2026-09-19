import { Platform } from 'react-native';
import { getTabBarStyle } from '@/features/navigation/tab-bar-style';
import { spacing } from '@/theme/spacing';

describe('getTabBarStyle', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  it('keeps the existing iOS tab bar style unchanged', () => {
    Platform.OS = 'ios';

    expect(getTabBarStyle({ top: 44, bottom: 34, left: 0, right: 0 })).toEqual({
      backgroundColor: '#0F0F16',
      borderTopColor: '#222230',
      borderTopWidth: 1,
      paddingTop: spacing.xs,
      minHeight: 60,
    });
  });

  it('applies the Android bottom safe-area inset to tab bar padding and height', () => {
    Platform.OS = 'android';

    expect(getTabBarStyle({ top: 0, bottom: 24, left: 0, right: 0 })).toEqual({
      backgroundColor: '#0F0F16',
      borderTopColor: '#222230',
      borderTopWidth: 1,
      paddingTop: spacing.xs,
      paddingBottom: 24,
      minHeight: 84,
    });
  });

  it('falls back to minimal Android padding when bottom inset is zero', () => {
    Platform.OS = 'android';

    expect(getTabBarStyle({ top: 0, bottom: 0, left: 0, right: 0 })).toEqual({
      backgroundColor: '#0F0F16',
      borderTopColor: '#222230',
      borderTopWidth: 1,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xs,
      minHeight: 64,
    });
  });
});
