const AUTH_ENTRY_SCREENS = new Set([
  'login',
  'register',
  'check-email',
  'forgot-password',
]);

const TOKEN_AUTH_FLOW_SCREENS = new Set(['verify-email', 'reset-password']);

export function isAuthEntryScreen(screen: string | undefined): boolean {
  return screen !== undefined && AUTH_ENTRY_SCREENS.has(screen);
}

export function isTokenAuthFlowScreen(screen: string | undefined): boolean {
  return screen !== undefined && TOKEN_AUTH_FLOW_SCREENS.has(screen);
}
