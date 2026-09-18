import { getApiBaseUrl, API_REQUEST_TIMEOUT_MS } from './config';
import { ApiError, mapStatusToErrorKind, type ProblemDetails } from './errors';

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
  headers?: Record<string, string>;
}

type TokenGetter = () => string | null;
type UnauthorizedHandler = () => void;

class ApiClient {
  private tokenGetter: TokenGetter | null = null;
  private unauthorizedHandler: UnauthorizedHandler | null = null;
  private isHandlingUnauthorized = false;

  setTokenGetter(getter: TokenGetter): void {
    this.tokenGetter = getter;
  }

  setUnauthorizedHandler(handler: UnauthorizedHandler): void {
    this.unauthorizedHandler = handler;
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

        if (kind === 'unauthorized' && authenticated) {
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

      if (error instanceof DOMException && error.name === 'AbortError') {
        if (signal?.aborted) {
          throw new ApiError({ kind: 'unknown', message: 'Request was cancelled.' });
        }

        throw new ApiError({ kind: 'timeout' });
      }

      throw new ApiError({ kind: 'network' });
    } finally {
      clearTimeout(timeoutId);
      signal?.removeEventListener('abort', abortListener);
    }
  }

  private handleUnauthorized(): void {
    if (this.isHandlingUnauthorized || !this.unauthorizedHandler) {
      return;
    }

    this.isHandlingUnauthorized = true;

    try {
      this.unauthorizedHandler();
    } finally {
      this.isHandlingUnauthorized = false;
    }
  }
}

export const api = new ApiClient();
