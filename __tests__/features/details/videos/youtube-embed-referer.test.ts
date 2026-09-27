import {
  TRAILER_PLAYER_CLOSE_MESSAGE,
  buildYoutubeTrailerPlayerHtml,
} from '@/features/details/videos/utils/build-youtube-trailer-player-html';
import { getYoutubeEmbedRefererOrigin } from '@/features/details/videos/utils/youtube-embed-referer';

describe('YouTube embed referer', () => {
  it('uses the app package as HTTPS origin', () => {
    expect(getYoutubeEmbedRefererOrigin()).toBe('https://com.movieapp.mobile');
  });

  it('includes origin in iframe player configuration', () => {
    const html = buildYoutubeTrailerPlayerHtml('dQw4w9WgXcQ', 'https://com.movieapp.mobile', {
      closeOnPresentationExit: true,
    });

    expect(html).toContain("origin: 'https://com.movieapp.mobile'");
    expect(html).toContain("videoId: 'dQw4w9WgXcQ'");
    expect(html).toContain(TRAILER_PLAYER_CLOSE_MESSAGE);
    expect(html).toContain('webkitfullscreenchange');
  });
});
