import {
  buildComingUpHref,
  openComingUpScreen,
  parseComingUpTab,
} from '@/features/upcoming/navigation/coming-up-navigation';

describe('coming-up-navigation', () => {
  it('parses tab query values', () => {
    expect(parseComingUpTab('for-you')).toBe('for-you');
    expect(parseComingUpTab('upcoming')).toBe('upcoming');
    expect(parseComingUpTab(undefined)).toBe('for-you');
  });

  it('builds href with default Coming Up route', () => {
    expect(buildComingUpHref()).toBe('/upcoming');
    expect(buildComingUpHref('for-you')).toBe('/upcoming?tab=for-you');
    expect(buildComingUpHref('upcoming')).toBe('/upcoming?tab=upcoming');
  });

  it('opens Coming Up with tab and optional return href', () => {
    const push = jest.fn();
    const router = { push } as never;

    openComingUpScreen(router, 'for-you', '/(tabs)/profile');

    expect(push).toHaveBeenCalledWith('/upcoming?tab=for-you');
  });
});
