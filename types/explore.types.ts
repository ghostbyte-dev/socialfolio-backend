export interface IExploreProfile {
  id: string;
  username: string;
  avatar: string;
  displayName: string;
  description: string;
  createdAt: Date;
}

export interface IExploreProfilesResponse {
  nextCursor: string | null;
  profiles: IExploreProfile[];
}

export enum ExploreFilter {
  LATEST="latest",
  POPUPLAR="popular"
}