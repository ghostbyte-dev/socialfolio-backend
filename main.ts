import { Application } from "jsr:@oak/oak/application";
import { Router } from "@oak/oak/router";
import profileController from "./controllers/profile.controller.ts";

const app = new Application();
const router = new Router();

router
  .use("/profile", profileController.routes());

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });