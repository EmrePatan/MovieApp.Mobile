import { Platform } from 'react-native';
import { BASE_TAB_BAR_HEIGHT, getTabBarStyle } from '@/features/navigation/tab-bar-style';
import { spacing } from '@/theme/spacing';

describe('getTabBarStyle', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  it('applies bottom safe-area inset on iOS', () => {
    Platform.OS = 'ios';

    const style = getTabBarStyle({ top: 44, bottom: 34, left: 0, right: 0 });

    expect(style.paddingBottom).toBe(34);
    expect(style.minHeight).toBeGreaterThanOrEqual(BASE_TAB_BAR_HEIGHT + 34);
  });

  it('uses minimal bottom padding on iOS when inset is zero', () => {
    Platform.OS = 'ios';

    const style = getTabBarStyle({ top: 0, bottom: 0, left: 0, right: 0 });

    expect(style.paddingBottom).toBe(spacing.xs);
    expect(style.minHeight).toBe(BASE_TAB_BAR_HEIGHT + spacing.xs);
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
