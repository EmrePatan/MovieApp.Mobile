import { api } from '@/api/client';
import { ApiError } from '@/api/errors';

describe('api client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = 'http://localhost:5027';
    api.resetUnauthorizedHandlingForTests();
    api.setTokenGetter(() => 'test-token');
    api.setAcceptLanguageGetter(() => 'en-US');
    api.setUnauthorizedHandler(jest.fn());
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('sends Accept-Language header from locale getter', async () => {
    api.setAcceptLanguageGetter(() => 'tr-TR');

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ id: 'movie-1' }),
    }) as unknown as typeof fetch;

    await api.get<{ id: string }>('/api/movies/11111111-1111-1111-1111-111111111111');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5027/api/movies/11111111-1111-1111-1111-111111111111',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Accept-Language': 'tr-TR',
        }),
      }),
    );
  });

  it('sends JSON requests with authorization header', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ id: 'user-1' }),
    }) as unknown as typeof fetch;

    const result = await api.get<{ id: string }>('/api/auth/me');

    expect(result).toEqual({ id: 'user-1' });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5027/api/auth/me',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          Accept: 'application/json',
        }),
      }),
    );
  });

  it('maps validation errors from ProblemDetails responses', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: { get: () => 'application/json' },
      json: async () => ({
        status: 400,
        title: 'Invalid login request.',
        detail: 'Password is required.',
      }),
    }) as unknown as typeof fetch;

    await expect(
      api.post('/api/auth/login', { email: 'a@b.com' }, { authenticated: false }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      kind: 'validation',
      status: 400,
      title: 'Invalid login request.',
    });
  });

  it('invokes unauthorized handler only once for concurrent 401 responses', async () => {
    const unauthorizedHandler = jest.fn(
      () => new Promise<void>((resolve) => setTimeout(resolve, 25)),
    );
    api.setUnauthorizedHandler(unauthorizedHandler);

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => 'application/json' },
      json: async () => ({
        status: 401,
        title: 'Authentication failed.',
      }),
    }) as unknown as typeof fetch;

    await Promise.allSettled([api.get('/api/auth/me'), api.get('/api/auth/me')]);
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(unauthorizedHandler).toHaveBeenCalledTimes(1);
  });

  it('does not invoke unauthorized handler when suppression is requested', async () => {
    const unauthorizedHandler = jest.fn();
    api.setUnauthorizedHandler(unauthorizedHandler);

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => 'application/json' },
      json: async () => ({
        status: 401,
        title: 'Authentication failed.',
      }),
    }) as unknown as typeof fetch;

    await expect(
      api.delete('/api/push-devices', { expoPushToken: 'token' }, {
        suppressUnauthorizedHandler: true,
      }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(unauthorizedHandler).not.toHaveBeenCalled();
  });

  it('invokes unauthorized handler on 401 responses', async () => {
    const unauthorizedHandler = jest.fn();
    api.setUnauthorizedHandler(unauthorizedHandler);

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => 'application/json' },
      json: async () => ({
        status: 401,
        title: 'Authentication failed.',
      }),
    }) as unknown as typeof fetch;

    await expect(api.get('/api/auth/me')).rejects.toBeInstanceOf(ApiError);
    expect(unauthorizedHandler).toHaveBeenCalledTimes(1);
  });

  it('maps network failures to ApiError', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));

    await expect(api.get('/api/auth/me')).rejects.toMatchObject<Partial<ApiError>>({
      kind: 'network',
    });
  });

  it('maps social auth conflicts from application/problem+json responses', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 409,
      headers: { get: () => 'application/problem+json' },
      json: async () => ({
        status: 409,
        title: 'Social authentication conflict.',
        detail:
          'An account with this email already exists. Sign in with your password to continue.',
      }),
    }) as unknown as typeof fetch;

    await expect(
      api.post('/api/auth/social', { provider: 'google', identityToken: 'token' }, {
        authenticated: false,
      }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      kind: 'conflict',
      status: 409,
      detail:
        'An account with this email already exists. Sign in with your password to continue.',
    });
  });

  it('preserves HTTP status when error response JSON parsing fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 409,
      headers: { get: () => 'application/json' },
      json: async () => {
        throw new SyntaxError('Unexpected end of JSON input');
      },
    }) as unknown as typeof fetch;

    await expect(
      api.post('/api/auth/social', { provider: 'google', identityToken: 'token' }, {
        authenticated: false,
      }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      kind: 'conflict',
      status: 409,
    });
  });
});
