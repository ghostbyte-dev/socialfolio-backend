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
  followersCount: string;
  url: string;
}

export interface PixelfedData extends WidgetData {
  username: string;
  description: string;
}

export interface NoteData extends WidgetData {
  note: string;
}
