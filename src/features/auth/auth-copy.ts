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

export const AUTH_FORGOT_PASSWORD_COPY = {
  taglineLines: ['NEED A', 'RESET?'],
  headlineLines: ['Forgot your', 'password?'],
  headlineAccentLineIndex: 1,
  supportingCopy: 'Enter your email and we will send reset instructions if an account exists.',
} as const;
