import { ObjectId } from "mongoose";
import Widget, { IWidget, WidgetType } from "../model/Widget.ts";
import { CreateWidgetDto, WidgetDto } from "../types/widget.types.ts";
import { UserService } from "./user.service.ts";
import { HttpError } from "../utils/HttpError.ts";
import { WidgetDataServiceFactory } from "./widgets/widgetdata.service.ts";
import { WidgetDataDto } from "../types/widgetdata.types.ts";
import mongoose from "mongoose";

export class WidgetService {
  static async widgets(username: string): Promise<WidgetDto[]> {
    const user = await UserService.getByUsername(username);
    const widgets: IWidget[] = await Widget.find({
      user: user._id,
    });
    return widgets.map((widget) => WidgetDto.fromWidget(widget));
  }

  static async getWidget(id: string): Promise<WidgetDataDto> {
    const widget: IWidget | null = await Widget.findById(id);
    if (widget == null) {
      throw new HttpError(400, "Widget not found");
    }

    const service = WidgetDataServiceFactory.createService(widget.type);
    const data = await service.fetchData(widget.data);

    return WidgetDataDto.fromWidgetData(widget, data);
  }

  static async createWidget(
    userId: ObjectId,
    createWidgetDto: CreateWidgetDto,
  ): Promise<WidgetDto> {
    if (!Object.values(WidgetType).includes(createWidgetDto.type)) {
      throw new HttpError(400, "Wrong Widget Type");
    }

    const newWidget: IWidget = await Widget.create({
      user: userId,
      type: createWidgetDto.type,
      variant: createWidgetDto.variant,
      size: createWidgetDto.size,
      data: createWidgetDto.data,
    });
    return WidgetDto.fromWidget(newWidget);
  }

  static async deleteWidget(userId: ObjectId, widgetId: string) {
    if (!mongoose.Types.ObjectId.isValid(widgetId)) {
      throw new HttpError(400, "Invalid Widget ID");
    }

    const widgetToDelete = await Widget.findById(widgetId);

    if (!widgetToDelete) {
      throw new HttpError(404, "Widget not found");
    }

    if (widgetToDelete.user != userId) {
      throw new HttpError(401, "Unauthorized");
    }

    await widgetToDelete.deleteOne();

    return;
  }
}
