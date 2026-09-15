export const galleryQueryKeys = {
  movie: (movieId: string) => ['gallery', 'movie', movieId] as const,
  tv: (tvShowId: string) => ['gallery', 'tv', tvShowId] as const,
  person: (tmdbPersonId: number) => ['gallery', 'person', tmdbPersonId] as const,
};
