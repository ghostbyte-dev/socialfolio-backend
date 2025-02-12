import { ObjectId } from "mongoose";
import Widget, { IWidget, WidgetType } from "../model/Widget.ts";
import { WidgetDto } from "../types/widget.types.ts";
import { UserService } from "./user.service.ts";

export class WidgetService {
  static async widgets(username: string): Promise<WidgetDto[]> {
    const user = await UserService.getByUsername(username);
    const widgets: IWidget[] = await Widget.find({
      user: user._id,
    });
    return widgets.map((widget) => WidgetDto.fromWidget(widget));
  }

  static async createWidget(userId: ObjectId): Promise<WidgetDto> {
    const newWidget: IWidget = await Widget.create({
      user: userId,
      type: WidgetType.Mastodon,
      variant: 1,
      size: {
        cols: 2,
        rows: 4,
      },
      data: {
        baseUrl: "https://mastodon.social",
        username: "hiebeler05",
      },
    });
    return WidgetDto.fromWidget(newWidget);
  }
}
