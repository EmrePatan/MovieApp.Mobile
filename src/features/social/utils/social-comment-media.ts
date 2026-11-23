const GIF_TOKEN = /\[gif\](https?:\/\/[^\]]+)\[\/gif\]/i;
/** Catalog still — posters or backdrops (legacy tag: poster). */
const IMAGE_TOKEN = /\[(?:poster|image)\]([^\]]+)\[\/(?:poster|image)\]/i;

/** Client-side spoiler flag: stored as a leading tag inside the content string. */
const SPOILER_TOKEN_TEXT = '[spoiler]';
const SPOILER_TOKEN = /^\s*\[spoiler\]\s*/i;

export type SocialCommentMediaKind = 'gif' | 'image';

export interface ParsedSocialCommentContent {
  text: string;
  /** True when the author marked the content as containing spoilers. */
  spoiler: boolean;
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
  spoiler = false,
): string {
  const trimmedText = text.trim();
  let body = trimmedText;
  if (media?.value.trim()) {
    body =
      media.kind === 'gif'
        ? embedGifInComment(media.value.trim(), trimmedText)
        : embedCatalogImageInComment(media.value.trim(), trimmedText);
  }
  return spoiler ? `${SPOILER_TOKEN_TEXT}${body}` : body;
}

export function parseSocialCommentContent(rawContent: string): ParsedSocialCommentContent {
  const spoiler = SPOILER_TOKEN.test(rawContent);
  const parsed = parseMediaContent(spoiler ? rawContent.replace(SPOILER_TOKEN, '') : rawContent);
  return { ...parsed, spoiler };
}

function parseMediaContent(content: string): Omit<ParsedSocialCommentContent, 'spoiler'> {
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
