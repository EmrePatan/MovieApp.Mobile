import { parseSocialCommentContent } from './social-comment-media';

/**
 * Plain-text preview of a raw review excerpt for compact surfaces.
 * Spoiler-flagged content never leaks: it is replaced by the spoiler label.
 */
export function resolveExcerptPreview(
  rawExcerpt: string | null | undefined,
  spoilerLabel: string,
): string {
  const parsed = parseSocialCommentContent(rawExcerpt ?? '');
  return parsed.spoiler ? spoilerLabel : parsed.text;
}
