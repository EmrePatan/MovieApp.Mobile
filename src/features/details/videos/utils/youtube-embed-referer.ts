import { APP_IDENTITY } from '../../../../../config/app-identity';

/** YouTube-required HTTPS referer origin for embedded playback in mobile WebViews. */
export function getYoutubeEmbedRefererOrigin(): string {
  return `https://${APP_IDENTITY.androidPackage}`;
}
