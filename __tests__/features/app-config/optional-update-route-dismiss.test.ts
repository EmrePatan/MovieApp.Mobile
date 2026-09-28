import { shouldDismissOptionalUpdateOnRouteChange } from '@/features/app-config/optional-update-route-dismiss';

describe('shouldDismissOptionalUpdateOnRouteChange', () => {
  it('does not dismiss when the banner is hidden', () => {
    expect(shouldDismissOptionalUpdateOnRouteChange(false, '/home', '/search')).toBe(false);
  });

  it('does not dismiss before a baseline path is captured', () => {
    expect(shouldDismissOptionalUpdateOnRouteChange(true, null, '/home')).toBe(false);
  });

  it('dismisses when the banner is visible and the path changes', () => {
    expect(shouldDismissOptionalUpdateOnRouteChange(true, '/home', '/search')).toBe(true);
  });

  it('does not dismiss when the path is unchanged', () => {
    expect(shouldDismissOptionalUpdateOnRouteChange(true, '/home', '/home')).toBe(false);
  });
});
