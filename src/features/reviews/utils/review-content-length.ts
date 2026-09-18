export function getReviewContentLength(content: string): number {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter !== 'undefined') {
    return Array.from(new Intl.Segmenter().segment(content)).length;
  }

  return Array.from(content).length;
}

export function hasReviewContent(content: string): boolean {
  return getReviewContentLength(content.trim()) > 0;
}

export const REVIEW_LIST_COLLAPSED_LINE_COUNT = 4;

export const REVIEW_OWN_COLLAPSED_LINE_COUNT = 2;

/** Rough width-based threshold before multi-line clamp likely truncates on phones. */
export function likelyExceedsCollapsedLines(content: string, lineCount: number): boolean {
  const charsPerLine = 44;
  return content.trim().length > lineCount * charsPerLine;
}
