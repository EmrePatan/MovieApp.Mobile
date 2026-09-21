import { isAuthEntryScreen, isTokenAuthFlowScreen } from '@/auth/auth-route-policy';

describe('auth-route-policy', () => {
  it('treats verify-email and reset-password as token auth flows', () => {
    expect(isTokenAuthFlowScreen('verify-email')).toBe(true);
    expect(isTokenAuthFlowScreen('reset-password')).toBe(true);
  });

  it('does not treat token flows as auth entry screens', () => {
    expect(isAuthEntryScreen('verify-email')).toBe(false);
    expect(isAuthEntryScreen('reset-password')).toBe(false);
    expect(isAuthEntryScreen('login')).toBe(true);
  });
});
