export const AUTH_LOGIN_COPY = {
  taglineLines: ['CURATED CINEMA,', 'EVERY NIGHT.'],
  headlineLines: ['Your next', 'favorite movie', 'is waiting.'],
  headlineAccentLineIndex: 2,
  emailDivider: 'OR SIGN IN WITH EMAIL',
} as const;

export const AUTH_REGISTER_COPY = {
  taglineLines: ['OPENING NIGHT', 'AWAITS.'],
  headlineLines: ['Create your', 'movie cave', 'account.'],
  headlineAccentLineIndex: 1,
  emailDivider: 'OR CREATE WITH EMAIL',
} as const;

export const AUTH_CHECK_EMAIL_COPY = {
  taglineLines: ['ALMOST', 'THERE.'],
  headlineLines: ['Check your', 'email inbox.'],
  headlineAccentLineIndex: 1,
  supportingCopy:
    'We sent a verification link to your email. Open it to activate your account before signing in.',
} as const;

export const AUTH_VERIFY_EMAIL_COPY = {
  taglineLines: ['ONE LAST', 'STEP.'],
  headlineLines: ['Verify your', 'email address.'],
  headlineAccentLineIndex: 1,
  supportingCopy: 'Confirming your email unlocks full access to MovieApp.',
} as const;

export const AUTH_FORGOT_PASSWORD_COPY = {
  taglineLines: ['NEED A', 'RESET?'],
  headlineLines: ['Forgot your', 'password?'],
  headlineAccentLineIndex: 1,
  supportingCopy: 'Enter your email and we will send reset instructions if an account exists.',
} as const;
