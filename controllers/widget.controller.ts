import { RouterContext } from "@oak/oak/router";
import { WidgetService } from "../services/widget.service.ts";
import {
  GET_WIDGET_ROUTE,
  GET_WIDGETS_ROUTE,
} from "../routes/widget.routes.ts";
import { HttpError } from "../utils/HttpError.ts";
import { Context } from "@oak/oak/context";
import { CreateWidgetDto } from "../types/widget.types.ts";

export class WidgetController {
  static async widgets(context: RouterContext<typeof GET_WIDGETS_ROUTE>) {
    const { username } = context.params;
    if (username == null) {
      context.response.status = 400;
      context.response.body = { message: "Username is required" };
      return;
    }
    try {
      const widgets = await WidgetService.widgets(context.params.username);
      context.response.status = 200;
      context.response.body = widgets;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }

  static async getWidget(context: RouterContext<typeof GET_WIDGET_ROUTE>) {
    const { id } = context.params;
    if (id == null) {
      context.response.status = 400;
      context.response.body = { message: "ID is required" };
      return;
    }

    try {
      const widget = await WidgetService.getWidget(id);
      context.response.status = 200;
      context.response.body = widget;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }

  static async createWidget(context: Context) {
    const userId = context.state.user.id;
    const createWidgetDto = await context.request.body
      .json() as CreateWidgetDto;

    try {
      const widget = await WidgetService.createWidget(userId, createWidgetDto);
      context.response.status = 201;
      context.response.body = widget;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }
}
