import { Router } from "@oak/oak/router";
import { StatsController } from "../controllers/stats.controller.ts";

const statsRouter = new Router();

statsRouter.get("/", StatsController.getStats)

export default statsRouter;