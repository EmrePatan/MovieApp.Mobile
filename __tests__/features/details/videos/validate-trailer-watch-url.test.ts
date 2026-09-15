import { isValidTrailerWatchUrl } from '@/features/details/videos/utils/validate-trailer-watch-url';

describe('isValidTrailerWatchUrl', () => {
  it('accepts canonical HTTPS YouTube watch URLs', () => {
    expect(isValidTrailerWatchUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
  });

  it('rejects HTTP URLs', () => {
    expect(isValidTrailerWatchUrl('http://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(false);
  });

  it('rejects arbitrary domains', () => {
    expect(isValidTrailerWatchUrl('https://example.com/watch?v=dQw4w9WgXcQ')).toBe(false);
  });

  it('rejects lookalike YouTube domains', () => {
    expect(isValidTrailerWatchUrl('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe(false);
    expect(isValidTrailerWatchUrl('https://www.youtube.com.evil/watch?v=dQw4w9WgXcQ')).toBe(false);
  });

  it('rejects malformed URLs', () => {
    expect(isValidTrailerWatchUrl('not-a-url')).toBe(false);
    expect(isValidTrailerWatchUrl('javascript:alert(1)')).toBe(false);
  });

  it('rejects URLs without a valid video id', () => {
    expect(isValidTrailerWatchUrl('https://www.youtube.com/watch?v=bad/id')).toBe(false);
  });
});
