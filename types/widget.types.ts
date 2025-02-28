import { ISize, IWidget } from "../model/Widget.ts";
import { HttpError } from "../utils/HttpError.ts";


export interface IFediverse {
  instance: string;
  username: string;
}

export interface INote {
  note: string;
}

export interface IUsername {
  username: string;
}

export interface ILink {
  link: string;
}

export interface ILocalTime {
  timezone: string;
}

export type IWidgetsData = IFediverse | INote | IUsername | ILocalTime | ILink;

export enum WidgetType {
  Pixelfed = "pixelfed",
  Mastodon = "mastodon",
  Fediverse = "fediverse",
  Note = "note",
  Github = "github",
  LocalTime = "localTime",
  Lemmy = "lemmy",
  Liberapay = "liberapay"
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
        return this.isFediverseData(data);
      case WidgetType.Note:
        return this.isNoteData(data);
      case WidgetType.Liberapay:
      case WidgetType.Github:
        return this.isUsernameData(data);
      case WidgetType.LocalTime:
        return this.isLocalTimeData(data);
        case WidgetType.Fediverse:
        return this.isLinkData(data);
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

  isLinkData(data: ILink) {
    return typeof data === "object" && data !== null &&
      typeof data.link === "string";
  }

  isLocalTimeData(data: ILocalTime) {
    return typeof data === "object" && data !== null &&
      typeof data.timezone === "string" &&
      Intl.supportedValuesOf("timeZone").includes(data.timezone);
  }
}
