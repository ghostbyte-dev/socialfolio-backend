import { Router } from "@oak/oak/router";
import { ExploreController } from "../controllers/explore.controller.ts";


const exploreRouter = new Router();

exploreRouter.get("/profiles", ExploreController.getExploreProfiles);

export default exploreRouter