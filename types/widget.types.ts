import { ISize, IWidget } from "../model/Widget.ts";

export class WidgetDto {
  constructor(
    public id: string,
    public type: string,
    public variant: number,
    public size: ISize,
  ) {}

  static fromWidget(widget: IWidget): WidgetDto {
    return new WidgetDto(
      widget._id,
      widget.type,
      widget.variant,
      widget.size,
    );
  }
}
