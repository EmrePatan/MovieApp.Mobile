const GIF_TOKEN = /\[gif\](https?:\/\/[^\]]+)\[\/gif\]/i;
/** Catalog still — posters or backdrops (legacy tag: poster). */
const IMAGE_TOKEN = /\[(?:poster|image)\]([^\]]+)\[\/(?:poster|image)\]/i;

export type SocialCommentMediaKind = 'gif' | 'image';

export interface ParsedSocialCommentContent {
  text: string;
  gifUrl: string | null;
  /** Catalog file path (poster or backdrop). */
  posterPath: string | null;
  mediaKind: SocialCommentMediaKind | null;
}

export interface SocialCommentMediaDraft {
  kind: SocialCommentMediaKind;
  /** HTTPS GIF URL or catalog image path. */
  value: string;
}

export function embedGifInComment(gifUrl: string, text = ''): string {
  const trimmedText = text.trim();
  const token = `[gif]${gifUrl}[/gif]`;
  return trimmedText ? `${trimmedText}\n${token}` : token;
}

export function embedPosterInComment(posterPath: string, text = ''): string {
  return embedCatalogImageInComment(posterPath, text);
}

export function embedCatalogImageInComment(imagePath: string, text = ''): string {
  const trimmedText = text.trim();
  const token = `[image]${imagePath}[/image]`;
  return trimmedText ? `${trimmedText}\n${token}` : token;
}

const GIPHY_URL = /https?:\/\/(?:media\d*\.)?giphy\.com\/\S+/i;

export function buildSocialCommentBody(
  text: string,
  media: SocialCommentMediaDraft | null,
): string {
  const trimmedText = text.trim();
  if (!media?.value.trim()) return trimmedText;
  if (media.kind === 'gif') return embedGifInComment(media.value.trim(), trimmedText);
  return embedCatalogImageInComment(media.value.trim(), trimmedText);
}

export function parseSocialCommentContent(content: string): ParsedSocialCommentContent {
  const gifMatch = content.match(GIF_TOKEN);
  if (gifMatch) {
    const gifUrl = gifMatch[1];
    const text = content.replace(GIF_TOKEN, '').replace(IMAGE_TOKEN, '').replace(/\n{2,}/g, '\n').trim();
    return { text, gifUrl, posterPath: null, mediaKind: 'gif' };
  }

  const imageMatch = content.match(IMAGE_TOKEN);
  if (imageMatch) {
    const posterPath = imageMatch[1].trim();
    const text = content.replace(IMAGE_TOKEN, '').replace(/\n{2,}/g, '\n').trim();
    return { text, gifUrl: null, posterPath, mediaKind: 'image' };
  }

  const trimmed = content.trim();
  const urlMatch = trimmed.match(GIPHY_URL);
  if (urlMatch?.[0] === trimmed) {
    return { text: '', gifUrl: urlMatch[0], posterPath: null, mediaKind: 'gif' };
  }
  if (urlMatch) {
    const text = trimmed.replace(urlMatch[0], '').replace(/\n{2,}/g, '\n').trim();
    return { text, gifUrl: urlMatch[0], posterPath: null, mediaKind: 'gif' };
  }

  return { text: trimmed, gifUrl: null, posterPath: null, mediaKind: null };
}

export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}
