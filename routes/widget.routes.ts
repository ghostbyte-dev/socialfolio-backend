import { Router } from "@oak/oak/router";
import { WidgetController } from "../controllers/widget.controller.ts";
import {
  authMiddleware,
  getTokenPayloadMiddleware,
} from "../utils/AuthMiddleware.ts";

const unsecuredWidgetRouter = new Router();
unsecuredWidgetRouter.use(getTokenPayloadMiddleware);

export const GET_WIDGETS_ROUTE = "/:username/all";
unsecuredWidgetRouter.get(GET_WIDGETS_ROUTE, WidgetController.widgets);
export const GET_WIDGET_ROUTE = "/:id";
unsecuredWidgetRouter.get(GET_WIDGET_ROUTE, WidgetController.getWidget);

const securedWidgetRouter = new Router();

securedWidgetRouter.use(authMiddleware);

securedWidgetRouter.post("/", WidgetController.createWidget);

export const DELETE_WIDGET_ROUTE = "/:id";
securedWidgetRouter.delete(DELETE_WIDGET_ROUTE, WidgetController.deleteWidget);

export const CHANGE_WIDGET_PRIORITY = "/priority/:id";
securedWidgetRouter.put(
  CHANGE_WIDGET_PRIORITY,
  WidgetController.updatePriority,
);

const widgetRouter = new Router();
widgetRouter.use(unsecuredWidgetRouter.routes());
widgetRouter.use(securedWidgetRouter.routes());

export default widgetRouter;
