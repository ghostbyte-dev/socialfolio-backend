import { Application } from "jsr:@oak/oak/application";
import { Router } from "@oak/oak/router";
import { connectDB } from "./database.ts";
import authRouter from "./routes/auth.routes.ts";
import { oakCors } from "cors";
import userRouter from "./routes/user.routes.ts";
import widgetRouter from "./routes/widget.routes.ts";
import { staticFileMiddleware } from "./utils/StaticFileMiddleware.ts";

const app = new Application();
const router = new Router();

connectDB();

app.use(staticFileMiddleware);

router
  .use("/api/auth", authRouter.routes())
  .use("/api/user", userRouter.routes())
  .use("/api/widgets", widgetRouter.routes());

app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
