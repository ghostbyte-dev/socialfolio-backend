import { Application } from "jsr:@oak/oak/application";
import { Router } from "@oak/oak/router";
import { connectDB, connectRedis } from "./database.ts";
import authRouter from "./routes/auth.routes.ts";
import { oakCors } from "cors";
import userRouter from "./routes/user.routes.ts";
import widgetRouter from "./routes/widget.routes.ts";
import { staticFileMiddleware } from "./utils/StaticFileMiddleware.ts";
import exploreRouter from "./routes/explore.routes.ts";
import statsRouter from "./routes/stats.router.ts";
// deno-lint-ignore no-import-prefix
import { metrics } from "npm:@opentelemetry/api@1";

const app = new Application();
const router = new Router();

const meter = metrics.getMeter("socialfolio-api");

const requestCounter = meter.createCounter("http_requests_total", {
  description: "Total number of HTTP requests",
});

export const botRequestCounter = meter.createCounter("http_bot_requests_total", {
  description: "Total number of detected bot/automated requests",
});

export const uniqueProfileClicks = meter.createCounter("http_unique_profile_clicks", {
  description: "Total number of unique profile clicks",
});


connectDB();
connectRedis();

app.use(staticFileMiddleware);
app.use(async (ctx, next) => {
  requestCounter.add(1, { method: ctx.request.method, path: ctx.request.url.pathname });
  await next();
});

router
  .use("/api/auth", authRouter.routes())
  .use("/api/user", userRouter.routes())
  .use("/api/widgets", widgetRouter.routes())
  .use("/api/explore", exploreRouter.routes())
  .use("/api/stats", statsRouter.routes());

app.use(oakCors());

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8001 });
