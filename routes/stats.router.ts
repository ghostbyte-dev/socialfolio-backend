import { Router } from "@oak/oak/router";
import { StatsController } from "../controllers/stats.controller.ts";

const statsRouter = new Router();

statsRouter.get("/", StatsController.getStats);
statsRouter.get("/widgets", StatsController.getAllWidgetStats);

export default statsRouter;
