export function getMovieSegmentIndex(segments: readonly string[]): number {
  return segments.indexOf('movie');
}

export function getTvSegmentIndex(segments: readonly string[]): number {
  return segments.indexOf('tv');
}

export function getPersonSegmentIndex(segments: readonly string[]): number {
  return segments.indexOf('person');
}
