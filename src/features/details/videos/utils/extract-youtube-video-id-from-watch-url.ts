import { isValidTrailerWatchUrl } from './validate-trailer-watch-url';

export function extractYouTubeVideoIdFromWatchUrl(url: string): string | null {
  if (!isValidTrailerWatchUrl(url)) {
    return null;
  }

  return new URL(url).searchParams.get('v');
}
