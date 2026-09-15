export const TRAILER_WATCH_URL_HOST = 'www.youtube.com';

export function isValidTrailerWatchUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    if (parsed.protocol !== 'https:') {
      return false;
    }

    if (parsed.hostname !== TRAILER_WATCH_URL_HOST) {
      return false;
    }

    if (parsed.pathname !== '/watch') {
      return false;
    }

    const videoId = parsed.searchParams.get('v');
    return typeof videoId === 'string' && /^[A-Za-z0-9_-]+$/.test(videoId);
  } catch {
    return false;
  }
}
