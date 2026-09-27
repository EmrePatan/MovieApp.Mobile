import { buildYoutubeTrailerPlayerHtml } from '@/features/details/videos/utils/build-youtube-trailer-player-html';
import { getYoutubeEmbedRefererOrigin } from '@/features/details/videos/utils/youtube-embed-referer';

describe('YouTube embed referer', () => {
  it('uses the app package as HTTPS origin', () => {
    expect(getYoutubeEmbedRefererOrigin()).toBe('https://com.movieapp.mobile');
  });

  it('includes origin in iframe player configuration', () => {
    const html = buildYoutubeTrailerPlayerHtml('dQw4w9WgXcQ', 'https://com.movieapp.mobile');

    expect(html).toContain("origin: 'https://com.movieapp.mobile'");
    expect(html).toContain("videoId: 'dQw4w9WgXcQ'");
  });
});
