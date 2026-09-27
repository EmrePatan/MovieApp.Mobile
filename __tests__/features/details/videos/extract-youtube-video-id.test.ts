import { extractYouTubeVideoIdFromWatchUrl } from '@/features/details/videos/utils/extract-youtube-video-id-from-watch-url';

describe('extractYouTubeVideoIdFromWatchUrl', () => {
  it('returns the v param for canonical watch URLs', () => {
    expect(
      extractYouTubeVideoIdFromWatchUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ');
  });

  it('returns null for invalid URLs', () => {
    expect(extractYouTubeVideoIdFromWatchUrl('https://evil.example/watch?v=abc')).toBeNull();
  });
});
