import { buildWatchlistShareMessage } from '@/features/watchlist-share/build-watchlist-share-message';
import {
  buildWatchlistShareRouterPath,
  parseWatchlistShareDeepLink,
} from '@/auth/watchlist-share-deep-link';
import { resolveWatchlistShareDeepLinkRouterPath } from '@/auth/watchlist-share-deep-link-route';

const TOKEN = 'abcdefghijklmnopqrstuvwxyz123456';

describe('watchlist share deep links', () => {
  it('parses canonical HTTPS watchlist URL', () => {
    expect(parseWatchlistShareDeepLink(`https://moviecaveapp.com/watchlist/${TOKEN}`)).toBe(
      TOKEN,
    );
  });

  it('resolves router path for public watchlist screen', () => {
    expect(
      resolveWatchlistShareDeepLinkRouterPath(`https://moviecaveapp.com/watchlist/${TOKEN}`),
    ).toBe(buildWatchlistShareRouterPath(TOKEN));
  });
});

describe('watchlist share message', () => {
  it('includes exactly one URL in the share message', () => {
    const url = `https://moviecaveapp.com/watchlist/${TOKEN}`;
    const t = (key: string) => (key === 'watchlistShare.messageIntro' ? 'Intro' : key);
    const message = buildWatchlistShareMessage(url, t);
    const matches = message.match(/https:\/\/[^\s]+/g) ?? [];
    expect(matches).toHaveLength(1);
    expect(matches[0]).toBe(url);
  });
});
