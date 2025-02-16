import {
  IGithub,
  ILocalTime,
  IMastodon,
  INote,
  IPixelfed,
} from "../model/Widget.ts";
import { ISize, IWidget, WidgetType } from "../model/Widget.ts";
import { HttpError } from "../utils/HttpError.ts";

export class WidgetDto {
  constructor(
    public id: string,
    public type: string,
    public variant: number,
    public size: ISize,
    public priority: number,
    public data?: IPixelfed | IMastodon | INote | IGithub | ILocalTime,
  ) {}

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

export class CreateWidgetDto {
  constructor(
    public type: WidgetType,
    public variant: number,
    public size: ISize,
    public data: IPixelfed | IMastodon | INote | IGithub | ILocalTime,
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
        return this.isPixelfedData(data);
      case WidgetType.Mastodon:
        return this.isMastodonData(data);
      case WidgetType.Note:
        return this.isNoteData(data);
      case WidgetType.Github:
        return this.isGithubData(data);
      case WidgetType.LocalTime:
        return this.isLocalTimeData(data);
      default:
        return false;
    }
  }

  isPixelfedData(data: IPixelfed) {
    return typeof data === "object" && data !== null &&
      typeof data.instance === "string" &&
      typeof data.username === "string";
  }

  isMastodonData(data: IMastodon) {
    return typeof data === "object" && data !== null &&
      typeof data.instance === "string" &&
      typeof data.username === "string";
  }

  isNoteData(data: INote) {
    return typeof data === "object" && data !== null &&
      typeof data.note === "string";
  }

  isGithubData(data: IGithub) {
    return typeof data === "object" && data !== null &&
      typeof data.username === "string";
  }

  isLocalTimeData(data: ILocalTime) {
    return typeof data === "object" && data !== null &&
      typeof data.timezone === "string" &&
      Intl.supportedValuesOf("timeZone").includes(data.timezone);
  }
}
