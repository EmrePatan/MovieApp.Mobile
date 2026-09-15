export interface CastRole {
  character: string | null;
  episodeCount: number;
}

export interface CastMember {
  providerPersonId: number | null;
  name: string;
  character: string | null;
  roles: CastRole[] | null;
  totalEpisodeCount: number | null;
  profileImagePath: string | null;
  order: number;
}

export interface CrewMember {
  providerPersonId: number | null;
  name: string;
  job: string;
  department: string;
  profileImagePath: string | null;
}

export interface CreditsResponse {
  cast: CastMember[];
  crew: CrewMember[];
}
