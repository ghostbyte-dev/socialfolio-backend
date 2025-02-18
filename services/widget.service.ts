import { ObjectId } from "mongoose";
import Widget, { IWidget, WidgetType } from "../model/Widget.ts";
import {
  CreateWidgetDto,
  UpdateWidgetDto,
  WidgetDto,
} from "../types/widget.types.ts";
import { UserService } from "./user.service.ts";
import { HttpError } from "../utils/HttpError.ts";
import { WidgetDataServiceFactory } from "./widgets/widgetdata.service.ts";
import { WidgetDataDto } from "../types/widgetdata.types.ts";
import mongoose from "mongoose";

export class WidgetService {
  static async widgets(
    username: string,
    jwtUserId: string | undefined,
  ): Promise<WidgetDto[]> {
    const user = await UserService.getByUsername(username, jwtUserId);
    const widgets: IWidget[] = await Widget.find({
      user: user._id,
    });
    widgets.sort((a: IWidget, b: IWidget) => a.priority - b.priority);
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

  static async updatePriority(
    userId: ObjectId,
    widgetId: string,
    priority: number,
  ): Promise<IWidget> {
    if (!mongoose.Types.ObjectId.isValid(widgetId)) {
      throw new HttpError(400, "Invalid Widget ID");
    }
    const widgetToUpdate = await Widget.findById(widgetId);

    if (!widgetToUpdate) {
      throw new HttpError(404, "Widget not found");
    }
    if (widgetToUpdate.user != userId) {
      throw new HttpError(401, "You can only edit your own widgets");
    }

    const updatedWidget: IWidget | null = await Widget.findByIdAndUpdate(
      widgetId,
      { priority },
      { new: true },
    );
    if (!updatedWidget) {
      throw new HttpError(500, "Failed to save widget");
    }
    return updatedWidget;
  }

  static async updateWidget(
    userId: ObjectId,
    widgetId: string,
    widget: UpdateWidgetDto,
  ): Promise<IWidget> {
    if (!mongoose.Types.ObjectId.isValid(widgetId)) {
      throw new HttpError(400, "Invalid Widget ID");
    }
    const widgetToUpdate = await Widget.findById(widgetId);

    if (!widgetToUpdate) {
      throw new HttpError(404, "Widget not found");
    }
    if (widgetToUpdate.user != userId) {
      throw new HttpError(401, "Unauthorized to edit this widget");
    }

    const updatedWidget = await Widget.findByIdAndUpdate(
      widgetId,
      { $set: widget },
      { new: true, upsert: false },
    );

    if (!updatedWidget) {
      throw new HttpError(500, "Failed to update widget");
    }

    return updatedWidget;
  }
}
