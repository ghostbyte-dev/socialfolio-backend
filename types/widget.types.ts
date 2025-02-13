import { IMastodon, INote, IPixelfed } from "../model/Widget.ts";
import { ISize, IWidget, WidgetType } from "../model/Widget.ts";

export class WidgetDto {
  constructor(
    public id: string,
    public type: string,
    public variant: number,
    public size: ISize,
    public data?: IPixelfed | IMastodon | INote,
  ) {}

  static fromWidget(widget: IWidget): WidgetDto {
    return new WidgetDto(
      widget._id,
      widget.type,
      widget.variant,
      widget.size,
      widget.data,
    );
  }
}

export class CreateWidgetDto {
  constructor(
    public type: WidgetType,
    public variant: number,
    public size: ISize,
    public data: IPixelfed | IMastodon | INote,
  ) {}
}
