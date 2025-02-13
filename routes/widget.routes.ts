import { Router } from "@oak/oak/router";
import { WidgetController } from "../controllers/widget.controller.ts";
import { authMiddleware } from "../utils/AuthMiddleware.ts";

const widgetRouter = new Router();

export const GET_WIDGETS_ROUTE = "/:username/all";
widgetRouter.get(GET_WIDGETS_ROUTE, WidgetController.widgets);
export const GET_WIDGET_ROUTE = "/:id";
widgetRouter.get(GET_WIDGET_ROUTE, WidgetController.getWidget);

widgetRouter.use(authMiddleware);

widgetRouter.post("/", WidgetController.createWidget);

export const DELETE_WIDGET_ROUTE = "/:id";
widgetRouter.delete(DELETE_WIDGET_ROUTE, WidgetController.deleteWidget);

export default widgetRouter;
