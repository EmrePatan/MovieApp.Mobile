export interface PrimaryVideo {
  site: string;
  type: string;
  name: string;
  language: string | null;
  official: boolean;
  watchUrl: string;
}

export interface VideosResponse {
  primary: PrimaryVideo | null;
}
