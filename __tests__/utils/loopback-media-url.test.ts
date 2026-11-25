import { rewriteLoopbackMediaUrl } from '@/utils/loopback-media-url';

describe('rewriteLoopbackMediaUrl', () => {
  const api = 'http://192.168.1.8:5027';

  it('moves loopback media onto the API origin', () => {
    expect(
      rewriteLoopbackMediaUrl('http://localhost:5027/profile-covers/u/abc.webp?v=2', api),
    ).toBe('http://192.168.1.8:5027/profile-covers/u/abc.webp?v=2');
  });

  it('leaves public hosts untouched', () => {
    expect(rewriteLoopbackMediaUrl('https://cdn.example.com/a.webp', api)).toBe(
      'https://cdn.example.com/a.webp',
    );
  });

  it('is a no-op when the API itself is loopback', () => {
    expect(rewriteLoopbackMediaUrl('http://localhost:5027/a.webp', 'http://localhost:5027')).toBe(
      'http://localhost:5027/a.webp',
    );
  });

  it('returns null for empty input', () => {
    expect(rewriteLoopbackMediaUrl('  ', api)).toBeNull();
    expect(rewriteLoopbackMediaUrl(undefined, api)).toBeNull();
  });
});
