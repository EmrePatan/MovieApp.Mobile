export interface WatchProvider {
  providerId: number;
  name: string;
  logoPath: string | null;
  displayPriority: number;
  availabilityTypes: string[];
  link: string | null;
}

export interface WatchProvidersResponse {
  region: string;
  providers: WatchProvider[];
  attributionLink: string | null;
}
