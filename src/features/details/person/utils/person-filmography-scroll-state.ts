const scrollOffsetsByPerson = new Map<number, number>();

export function getPersonFilmographyScrollOffset(tmdbPersonId: number): number {
  return scrollOffsetsByPerson.get(tmdbPersonId) ?? 0;
}

export function setPersonFilmographyScrollOffset(tmdbPersonId: number, offset: number): void {
  scrollOffsetsByPerson.set(tmdbPersonId, offset);
}

export function resetPersonFilmographyScrollStateForTests(): void {
  scrollOffsetsByPerson.clear();
}
