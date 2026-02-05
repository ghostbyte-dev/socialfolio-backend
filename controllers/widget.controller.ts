import { RouterContext } from "@oak/oak/router";
import { WidgetService } from "../services/widget.service.ts";
import {
  CHANGE_WIDGET_PRIORITY,
  DELETE_WIDGET_ROUTE,
  GET_WIDGET_MASTODON,
  GET_WIDGET_ROUTE,
  GET_WIDGETS_ROUTE,
  UPDATE_WIDGET_ROUTE,
} from "../routes/widget.routes.ts";
import { HttpError } from "../utils/HttpError.ts";
import { Context } from "@oak/oak/context";
import { CreateWidgetDto, UpdateWidgetDto } from "../types/widget.types.ts";
import { getOrigin } from "../utils/getOrigin.ts";

export class WidgetController {
  static async widgets(context: RouterContext<typeof GET_WIDGETS_ROUTE>) {
    const userId: string | undefined = context.state.user?.id;
    const { username } = context.params;
    if (username == null) {
      context.response.status = 400;
      context.response.body = { message: "Username is required" };
      return;
    }
    try {
      const widgets = await WidgetService.widgets(
        context.params.username,
        userId,
      );
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


  static async getMastodonWidget(context: RouterContext<typeof GET_WIDGET_MASTODON>) {
    const { username } = context.params;
    if (username == null) {
      context.response.status = 400;
      context.response.body = { message: "Username is required" };
      return;
    }

    try {
      const widgets = await WidgetService.getMastodonWidgets(username);
      context.response.status = 200;
      context.response.body = widgets;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }

  static async createWidget(context: Context) {
    const userId = context.state.user.id;

    try {
      const origin = getOrigin(context);

      const createWidgetDto = CreateWidgetDto
        .fromJson(await context.request.body.json());
      const widget = await WidgetService.createWidget(
        userId,
        createWidgetDto,
        origin,
      );
      context.response.status = 201;
      context.response.body = widget;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }

  static async deleteWidget(
    context: RouterContext<typeof DELETE_WIDGET_ROUTE>,
  ) {
    const userId = context.state.user.id;
    const { id } = context.params;
    if (id == null) {
      context.response.status = 400;
      context.response.body = { message: "ID is required" };
      return;
    }

    try {
      await WidgetService.deleteWidget(userId, id);
      context.response.status = 200;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }

  static async updatePriority(
    context: RouterContext<typeof CHANGE_WIDGET_PRIORITY>,
  ) {
    const userId = context.state.user.id;
    const { id } = context.params;
    if (id == null) {
      context.response.status = 400;
      context.response.body = { message: "ID is required" };
      return;
    }

    const body = await context.request.body.json();
    const priority = body.priority;

    if (priority == null) {
      context.response.status = 400;
      context.response.body = { message: "priority is required" };
      return;
    }
    try {
      const widget = await WidgetService.updatePriority(userId, id, priority);
      context.response.status = 201;
      context.response.body = widget;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }

  static async updateWidget(
    context: RouterContext<typeof UPDATE_WIDGET_ROUTE>,
  ) {
    const userId = context.state.user.id;
    const { id } = context.params;
    if (id == null) {
      context.response.status = 400;
      context.response.body = { message: "ID is required" };
      return;
    }

    try {
      const updateWidgetDto = UpdateWidgetDto
        .fromJson(await context.request.body.json());
      const widget = await WidgetService.updateWidget(
        userId,
        id,
        updateWidgetDto,
      );
      context.response.status = 200;
      context.response.body = widget;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }
}
