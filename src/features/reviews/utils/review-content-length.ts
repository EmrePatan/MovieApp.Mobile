export function getReviewContentLength(content: string): number {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter !== 'undefined') {
    return Array.from(new Intl.Segmenter().segment(content)).length;
  }

  return Array.from(content).length;
}

export function hasReviewContent(content: string): boolean {
  return getReviewContentLength(content.trim()) > 0;
}
