import { Application } from "jsr:@oak/oak/application";
import { Router } from "@oak/oak/router";
import authController from "./controllers/auth.controller.ts";
import { connectDB } from "./database.ts";

const app = new Application();
const router = new Router();

connectDB();

router
  .use("/api/auth", authController.routes());

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });