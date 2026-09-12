import { api } from '@/api/client';
import { ApiError } from '@/api/errors';

describe('api client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = 'http://localhost:5027';
    api.setTokenGetter(() => 'test-token');
    api.setUnauthorizedHandler(jest.fn());
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
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
});
