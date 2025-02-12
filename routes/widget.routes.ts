import { Router } from "@oak/oak/router";
import { WidgetController } from "../controllers/widget.controller.ts";
import { authMiddleware } from "../utils/AuthMiddleware.ts";

const widgetRouter = new Router();

export const GET_WIDGETS_ROUTE = "/:username";
widgetRouter.get(GET_WIDGETS_ROUTE, WidgetController.widgets);

widgetRouter.use(authMiddleware);

widgetRouter.post("/", WidgetController.createWidget);

export default widgetRouter;