import { i18n } from '@/i18n';

export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limited'
  | 'server'
  | 'unknown';

export interface ProblemDetails {
  status?: number;
  title?: string;
  detail?: string;
  code?: string;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  readonly title: string;
  readonly detail: string | null;
  readonly userMessage: string;
  readonly responseBody: unknown | null;

  constructor(options: {
    kind: ApiErrorKind;
    status?: number | null;
    title?: string;
    detail?: string | null;
    userMessage?: string;
    message?: string;
    responseBody?: unknown | null;
  }) {
    super(
      options.message ??
        options.userMessage ??
        options.title ??
        i18n.t('errors.requestFailed'),
    );
    this.name = 'ApiError';
    this.kind = options.kind;
    this.status = options.status ?? null;
    this.title = options.title ?? i18n.t('errors.requestFailed');
    this.detail = options.detail ?? null;
    this.userMessage = options.userMessage ?? getDefaultUserMessage(options.kind);
    this.responseBody = options.responseBody ?? null;
  }
}

export function getApiErrorDisplayMessage(
  error: unknown,
  fallback = i18n.t('errors.generic'),
): string {
  if (!isApiError(error)) {
    return fallback;
  }

  return error.detail ?? error.title ?? error.userMessage;
}

export function getDefaultUserMessage(kind: ApiErrorKind): string {
  switch (kind) {
    case 'network':
      return i18n.t('errors.network');
    case 'timeout':
      return i18n.t('errors.timeout');
    case 'validation':
      return i18n.t('errors.validation');
    case 'unauthorized':
      return i18n.t('errors.unauthorized');
    case 'forbidden':
      return i18n.t('errors.forbidden');
    case 'not_found':
      return i18n.t('errors.notFound');
    case 'conflict':
      return i18n.t('errors.conflict');
    case 'rate_limited':
      return i18n.t('errors.rateLimited');
    case 'server':
      return i18n.t('errors.server');
    default:
      return i18n.t('errors.generic');
  }
}

export function mapStatusToErrorKind(status: number): ApiErrorKind {
  if (status === 400) return 'validation';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'server';
  return 'unknown';
}

export function getProblemCode(responseBody: unknown): string | null {
  if (!responseBody || typeof responseBody !== 'object') {
    return null;
  }

  const code = (responseBody as ProblemDetails).code;
  return typeof code === 'string' ? code : null;
}

export const EMAIL_NOT_VERIFIED_CODE = 'email_not_verified';

export function isEmailNotVerifiedError(error: unknown): boolean {
  return isApiError(error) && getProblemCode(error.responseBody) === EMAIL_NOT_VERIFIED_CODE;
}

export function getUserMessageForAuthError(
  kind: ApiErrorKind,
  context:
    | 'login'
    | 'register'
    | 'forgot-password'
    | 'reset-password'
    | 'verify-email'
    | 'resend-verification'
    | 'social',
): string {
  if (kind === 'unauthorized' && context === 'login') {
    return i18n.t('errors.authLoginInvalid');
  }

  if (kind === 'validation' && context === 'verify-email') {
    return i18n.t('errors.authVerifyEmailInvalid');
  }

  if (kind === 'conflict' && context === 'register') {
    return i18n.t('errors.authRegisterConflict');
  }

  if (kind === 'conflict' && context === 'social') {
    return i18n.t('errors.authSocialConflict');
  }

  if (kind === 'unauthorized' && context === 'social') {
    return i18n.t('errors.authSocialFailed');
  }

  if (kind === 'rate_limited') {
    return i18n.t('errors.authRateLimited');
  }

  if (kind === 'validation' && context === 'reset-password') {
    return i18n.t('errors.authResetTokenInvalid');
  }

  if (kind === 'validation') {
    if (context === 'register') {
      return i18n.t('errors.authRegisterValidation');
    }

    if (context === 'forgot-password') {
      return i18n.t('errors.authForgotPasswordValidation');
    }

    if (context === 'reset-password') {
      return i18n.t('errors.authResetPasswordValidation');
    }

    return i18n.t('errors.authCredentialsValidation');
  }

  if (kind === 'network' || kind === 'timeout') {
    return i18n.t('errors.authNetwork');
  }

  return getDefaultUserMessage(kind);
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getErrorMessage(error: unknown, fallback = i18n.t('errors.generic')): string {
  if (isApiError(error)) {
    return error.userMessage;
  }

  return fallback;
}
