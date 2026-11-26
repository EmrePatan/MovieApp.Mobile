/** Display-only facts from the API. Missing until the title has been fetched once. */
export interface DetailExtras {
  tagline: string | null;
  /** Age rating by ISO 3166-1 country code. */
  certifications: Record<string, string>;
  networks: string[];
  creators: string[];
  productionCompanies: string[];
  budget: number | null;
  revenue: number | null;
  lastEpisode: {
    seasonNumber: number;
    episodeNumber: number;
    airDate: string | null;
  } | null;
}
