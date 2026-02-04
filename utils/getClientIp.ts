import { RouterContext } from "@oak/oak/router";
import { GET_BY_USERNAME_ROUTE } from "../routes/user.routes.ts";

export function getClientIp(
  context: RouterContext<typeof GET_BY_USERNAME_ROUTE>,
) {
  const forwarded = context.request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return context.request.ip;
}
