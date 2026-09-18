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
    super(options.message ?? options.userMessage ?? options.title ?? 'Request failed');
    this.name = 'ApiError';
    this.kind = options.kind;
    this.status = options.status ?? null;
    this.title = options.title ?? 'Request failed';
    this.detail = options.detail ?? null;
    this.userMessage = options.userMessage ?? getDefaultUserMessage(options.kind);
    this.responseBody = options.responseBody ?? null;
  }
}

export function getApiErrorDisplayMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!isApiError(error)) {
    return fallback;
  }

  return error.detail ?? error.title ?? error.userMessage;
}

function getDefaultUserMessage(kind: ApiErrorKind): string {
  switch (kind) {
    case 'network':
      return 'Unable to connect. Check your internet connection and try again.';
    case 'timeout':
      return 'The request timed out. Please try again.';
    case 'validation':
      return 'Please check your input and try again.';
    case 'unauthorized':
      return 'Your session has expired. Please sign in again.';
    case 'forbidden':
      return 'You do not have permission to perform this action.';
    case 'not_found':
      return 'The requested resource was not found.';
    case 'conflict':
      return 'This action could not be completed because of a conflict.';
    case 'rate_limited':
      return 'Too many requests. Please wait a moment and try again.';
    case 'server':
      return 'Something went wrong on our end. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
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

export function getUserMessageForAuthError(
  kind: ApiErrorKind,
  context: 'login' | 'register' | 'forgot-password' | 'reset-password' | 'social',
): string {
  if (kind === 'unauthorized' && context === 'login') {
    return 'Invalid email or password.';
  }

  if (kind === 'conflict' && context === 'register') {
    return 'An account with this email already exists.';
  }

  if (kind === 'conflict' && context === 'social') {
    return 'An account with this email already exists. Sign in with your password to continue.';
  }

  if (kind === 'unauthorized' && context === 'social') {
    return 'Social sign-in failed. Please try again.';
  }

  if (kind === 'rate_limited') {
    return 'Too many attempts. Please try again later.';
  }

  if (kind === 'validation' && context === 'reset-password') {
    return 'Invalid or expired reset token.';
  }

  if (kind === 'validation') {
    if (context === 'register') {
      return 'Please check your registration details and try again.';
    }

    if (context === 'forgot-password') {
      return 'Please enter a valid email address.';
    }

    if (context === 'reset-password') {
      return 'Please check your password and try again.';
    }

    return 'Please check your email and password.';
  }

  if (kind === 'network' || kind === 'timeout') {
    return 'Unable to reach the server. Check your connection and try again.';
  }

  return getDefaultUserMessage(kind);
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (isApiError(error)) {
    return error.userMessage;
  }

  return fallback;
}
