import { ISize, IWidget } from "../model/Widget.ts";
import { HttpError } from "../utils/HttpError.ts";

export interface IFediverse {
  instance: string;
  username: string;
}

export interface IBluesky {
  handle: string;
}

export interface INote {
  note: string;
}

export interface IUsername {
  username: string;
}

export interface IFediverseWidget {
  link: string;
  fediverseHandle: string;
}

export interface ILocalTime {
  timezone: string;
}

export interface ILink {
  link: string;
  label: string;
}

export interface IEmail {
  email: string;
}

export interface ICountry {
  countryName: string;
}

export interface IImage {
  image: string;
  link: string | undefined;
}

export type IWidgetsData = IFediverse | INote | IUsername | ILocalTime | IFediverseWidget | IEmail | ILink | IBluesky | ICountry | IImage;

export enum WidgetType {
  Pixelfed = "pixelfed",
  Mastodon = "mastodon",
  Fediverse = "fediverse",
  Peertube = "peertube",
  Vernissage = "vernissage",
  BookyWyrm = "bookwyrm",
  Matrix = "matrix",
  Bluesky = "bluesky",
  NeoDb = "neodb",
  Note = "note",
  Github = "github",
  Codeberg = "codeberg",
  LocalTime = "localTime",
  Lemmy = "lemmy",
  Liberapay = "liberapay",
  BuyMeACoffee = "buymeacoffee",
  KoFi = "kofi",
  Email = "email",
  Link = "link",
  Country = "country",
  Image = "image"
}

export class WidgetDto {
  constructor(
    public id: string,
    public type: string,
    public variant: number,
    public size: ISize,
    public priority: number,
    public data?: IWidgetsData,
  ) { }

  static fromWidget(widget: IWidget): WidgetDto {
    return new WidgetDto(
      widget._id,
      widget.type,
      widget.variant,
      widget.size,
      widget.priority,
      widget.data,
    );
  }
}

export class UpdateWidgetDto {
  constructor(
    public variant?: number,
    public size?: ISize,
    public data?: IWidgetsData,
    public priority?: number
  ) { }

  // deno-lint-ignore no-explicit-any
  static fromJson(json: any): UpdateWidgetDto {
    if (!json || typeof json !== "object") {
      throw new Error("Invalid JSON payload");
    }
    return new UpdateWidgetDto(
      json.variant,
      json.size,
      json.data,
      json.priority
    );
  }
}

export class CreateWidgetDto {
  constructor(
    public type: WidgetType,
    public variant: number,
    public size: ISize,
    public data: IWidgetsData,
  ) {
    if (!this.isValidData(type, data)) {
      throw new HttpError(400, "Invalid data for widget type: " + type);
    }
  }

  // deno-lint-ignore no-explicit-any
  static fromJson(json: any): CreateWidgetDto {
    if (!json || typeof json !== "object") {
      throw new Error("Invalid JSON payload");
    }
    return new CreateWidgetDto(
      json.type,
      json.variant,
      json.size,
      json.data,
    );
  }

  // deno-lint-ignore no-explicit-any
  isValidData(type: WidgetType, data: any): boolean {
    switch (type) {
      case WidgetType.Pixelfed:
      case WidgetType.Mastodon:
      case WidgetType.Lemmy:
      case WidgetType.Peertube:
      case WidgetType.Matrix:
      case WidgetType.NeoDb:
      case WidgetType.BookyWyrm:
        return this.isFediverseData(data);
      case WidgetType.Note:
        return this.isNoteData(data);
      case WidgetType.Liberapay:
      case WidgetType.Github:
      case WidgetType.BuyMeACoffee:
      case WidgetType.Codeberg:
      case WidgetType.Vernissage:
      case WidgetType.KoFi:
        return this.isUsernameData(data);
      case WidgetType.LocalTime:
        return this.isLocalTimeData(data);
      case WidgetType.Fediverse:
        return this.isFediverseWidgetData(data);
      case WidgetType.Email:
        return this.isEmailData(data);
      case WidgetType.Link:
        return this.isLinkData(data);
      case WidgetType.Bluesky:
        return this.isBlueskyData(data);
      case WidgetType.Country:
        return this.isCountryData(data);
      case WidgetType.Image:
        return this.isImageData(data);
      default:
        return false;
    }
  }

  isFediverseData(data: IFediverse) {
    return typeof data === "object" && data !== null &&
      typeof data.instance === "string" &&
      typeof data.username === "string";
  }

  isNoteData(data: INote) {
    return typeof data === "object" && data !== null &&
      typeof data.note === "string";
  }

  isUsernameData(data: IUsername) {
    return typeof data === "object" && data !== null &&
      typeof data.username === "string";
  }

  isFediverseWidgetData(data: IFediverseWidget) {
    return typeof data === "object" && data !== null &&
      typeof data.link === "string" &&
      typeof data.fediverseHandle == "string"
  }

  isLocalTimeData(data: ILocalTime) {
    return typeof data === "object" && data !== null &&
      typeof data.timezone === "string" &&
      Intl.supportedValuesOf("timeZone").includes(data.timezone);
  }

  isEmailData(data: IEmail) {
    return typeof data === "object" && data !== null &&
      typeof data.email === "string";
  }

  isLinkData(data: ILink) {
    return typeof data === "object" && data !== null &&
      typeof data.link === "string" &&
      typeof data.label === "string";
  }

  isBlueskyData(data: IBluesky) {
    return typeof data === "object" && data !== null &&
      typeof data.handle === "string";
  }

  isCountryData(data: ICountry) {
    return typeof data === "object" && data != null &&
      typeof data.countryName === "string";
  }

  isImageData(data: IImage) {
    return typeof data === "object" && data != null &&
      typeof data.image === "string";
  }
}
