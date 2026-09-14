export interface CastMember {
  providerPersonId: number | null;
  name: string;
  character: string | null;
  profileImagePath: string | null;
  order: number;
}

export interface CreditsResponse {
  cast: CastMember[];
}
