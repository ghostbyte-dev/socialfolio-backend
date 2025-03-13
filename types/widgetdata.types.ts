import { IWidget } from "../model/Widget.ts";

export class WidgetDataDto {
  constructor(
    public id: string,
    public user: string,
    public type: string,
    public variant: number,
    public size: { cols: number; rows: number },
    public data: WidgetData,
  ) {}

  static fromWidgetData(widget: IWidget, widgetData: WidgetData) {
    const userId = widget.user.toString();
    return new WidgetDataDto(
      widget._id,
      userId,
      widget.type,
      widget.variant,
      widget.size,
      widgetData,
    );
  }
}

// deno-lint-ignore no-empty-interface
export interface WidgetData {}

export interface MastodonData extends WidgetData {
  username: string;
  displayName: string;
  description: string;
  avatar: string;
  followersCount: number;
  followingCount: number;
  statusesCount: number;
  url: string;
}

export interface WeatherData extends WidgetData {
  elevation: number;
  isDay: boolean;
  current: {
    weatherCode: number;
  };
}

export interface GithubData extends WidgetData {
  username: string;
  name: string;
  avatar: string;
  url: string;
  location: string;
  followers: number;
  following: number;
  publicRepos: number;
  contributions: ContributionsCollection;
}

export interface ContributionsCollection {
  colors: string[];
  totalContributions: number;
  weeks: ContributionsWeek[];
}

interface ContributionsWeek {
  contributionDays: ContributionDay[];
  firtsDay: string;
}

interface ContributionDay {
  color: string;
  contributeCount: number;
  date: string;
  weekday: number;
}
