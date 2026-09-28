import { redirectSystemPath } from '../../app/+native-intent';

describe('+native-intent redirectSystemPath', () => {
  it('redirects cold-start verify-email URLs to grouped auth routes', () => {
    expect(
      redirectSystemPath({
        path: 'movieapp://verify-email?token=abc123',
        initial: true,
      }),
    ).toBe('/(auth)/verify-email?token=abc123');
  });

  it('redirects warm reset-password URLs to grouped auth routes', () => {
    expect(
      redirectSystemPath({
        path: 'movieapp://reset-password?token=reset-token',
        initial: false,
      }),
    ).toBe('/(auth)/reset-password?token=reset-token');
  });

  it('redirects catalog movie URLs to grouped detail routes', () => {
    const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    expect(
      redirectSystemPath({
        path: `movieapp://movie/${movieId}`,
        initial: true,
      }),
    ).toBe(`/movie/${movieId}`);
  });

  it('redirects HTTPS tv URLs to grouped detail routes', () => {
    const tvId = '4fa85f64-5717-4562-b3fc-2c963f66afa7';
    expect(
      redirectSystemPath({
        path: `https://moviecaveapp.com/tv/${tvId}`,
        initial: false,
      }),
    ).toBe(`/tv/${tvId}`);
  });

  it('passes unrelated URLs through unchanged', () => {
    const path = 'movieapp://unknown/123';
    expect(redirectSystemPath({ path, initial: true })).toBe(path);
  });
});
