import { getApiBaseUrl, API_REQUEST_TIMEOUT_MS } from './config';
import { ApiError, mapStatusToErrorKind, type ProblemDetails } from './errors';

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: unknown }).name === 'AbortError'
  );
}

function isJsonResponseContentType(contentType: string): boolean {
  const normalized = contentType.toLowerCase();

  return (
    normalized.includes('application/json') || normalized.includes('application/problem+json')
  );
}

async function readJsonResponseBody(response: Response): Promise<unknown | null> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!isJsonResponseContentType(contentType)) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export interface RequestOptions {
  signal?: AbortSignal;
  authenticated?: boolean;
  suppressUnauthorizedHandler?: boolean;
  isRetryAfterRefresh?: boolean;
  headers?: Record<string, string>;
}

type TokenGetter = () => string | null;
type UnauthorizedHandler = () => void | Promise<void>;
type SessionRefreshHandler = () => Promise<boolean>;
type AcceptLanguageGetter = () => string;

class ApiClient {
  private tokenGetter: TokenGetter | null = null;
  private acceptLanguageGetter: AcceptLanguageGetter | null = null;
  private unauthorizedHandler: UnauthorizedHandler | null = null;
  private sessionRefreshHandler: SessionRefreshHandler | null = null;
  private unauthorizedTeardownPromise: Promise<void> | null = null;
  private sessionRefreshPromise: Promise<boolean> | null = null;

  setTokenGetter(getter: TokenGetter): void {
    this.tokenGetter = getter;
  }

  hasAccessToken(): boolean {
    return Boolean(this.tokenGetter?.());
  }

  setAcceptLanguageGetter(getter: AcceptLanguageGetter): void {
    this.acceptLanguageGetter = getter;
  }

  setUnauthorizedHandler(handler: UnauthorizedHandler): void {
    this.unauthorizedHandler = handler;
  }

  setSessionRefreshHandler(handler: SessionRefreshHandler): void {
    this.sessionRefreshHandler = handler;
  }

  resetUnauthorizedHandlingForTests(): void {
    this.unauthorizedTeardownPromise = null;
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, options);
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  delete<T = void>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, body, options);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    const { signal, authenticated = true, headers = {} } = options;
    const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...headers,
    };

    const acceptLanguage = this.acceptLanguageGetter?.();
    if (acceptLanguage) {
      requestHeaders['Accept-Language'] = acceptLanguage;
    }

    if (body !== undefined) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    if (authenticated) {
      const token = this.tokenGetter?.() ?? null;
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);

    const abortListener = () => controller.abort();
    signal?.addEventListener('abort', abortListener);

    try {
      if (signal?.aborted) {
        throw new ApiError({ kind: 'cancelled' });
      }

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (response.status === 204) {
        return undefined as T;
      }

      const payload = await readJsonResponseBody(response);

      if (!response.ok) {
        const problem = (payload ?? {}) as ProblemDetails;
        const kind = mapStatusToErrorKind(response.status);

        if (
          kind === 'unauthorized' &&
          authenticated &&
          !options.suppressUnauthorizedHandler &&
          !options.isRetryAfterRefresh
        ) {
          const refreshed = await this.tryRefreshSession();
          if (refreshed) {
            return this.request<T>(method, path, body, {
              ...options,
              isRetryAfterRefresh: true,
            });
          }

          this.handleUnauthorized();
        }

        throw new ApiError({
          kind,
          status: response.status,
          title: problem.title,
          detail: problem.detail ?? null,
          responseBody: payload,
        });
      }

      return payload as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (isAbortError(error)) {
        if (signal?.aborted) {
          throw new ApiError({ kind: 'cancelled' });
        }

        throw new ApiError({ kind: 'timeout' });
      }

      throw new ApiError({ kind: 'network' });
    } finally {
      clearTimeout(timeoutId);
      signal?.removeEventListener('abort', abortListener);
    }
  }

  private async tryRefreshSession(): Promise<boolean> {
    if (!this.sessionRefreshHandler) {
      return false;
    }

    if (!this.sessionRefreshPromise) {
      this.sessionRefreshPromise = this.sessionRefreshHandler()
        .catch(() => false)
        .finally(() => {
          this.sessionRefreshPromise = null;
        });
    }

    return await this.sessionRefreshPromise;
  }

  private handleUnauthorized(): void {
    if (!this.unauthorizedHandler || this.unauthorizedTeardownPromise) {
      return;
    }

    this.unauthorizedTeardownPromise = Promise.resolve(this.unauthorizedHandler())
      .catch(() => {
        // Session teardown is best-effort; callers still receive the original 401.
      })
      .finally(() => {
        this.unauthorizedTeardownPromise = null;
      });
  }
}

export const api = new ApiClient();
