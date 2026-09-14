export interface PersonFilmographyEntry {
  mediaType: 'movie' | 'tv';
  catalogId: string | null;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  character: string | null;
  releaseDate: string | null;
}

export interface PersonDetailResponse {
  id: string;
  tmdbId: number;
  name: string;
  profileImagePath: string | null;
  biography: string | null;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  knownForDepartment: string | null;
  filmography: PersonFilmographyEntry[];
}
