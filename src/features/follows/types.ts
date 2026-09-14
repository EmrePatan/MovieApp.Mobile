export interface MovieFollowStatusResponse {
  isFollowing: boolean;
}

export interface TvShowFollowStatusResponse {
  isFollowing: boolean;
  notifyNewSeasons: boolean;
  notifyNewEpisodes: boolean;
  baselineEstablished: boolean;
}

export interface UpsertTvShowFollowRequest {
  notifyNewSeasons: boolean | null;
  notifyNewEpisodes: boolean | null;
}

export interface RegisterPushDeviceRequest {
  expoPushToken: string;
  platform: 'ios' | 'android';
}

export interface UnregisterPushDeviceRequest {
  expoPushToken: string;
}

export type PushRegistrationResult =
  | 'registered'
  | 'permission_denied'
  | 'unavailable'
  | 'skipped';
