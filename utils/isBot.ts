import { RouterContext } from "@oak/oak/router";
import { GET_BY_USERNAME_ROUTE } from "../routes/user.routes.ts";

export const isBot = (context: RouterContext<typeof GET_BY_USERNAME_ROUTE>): Boolean => {
    const userAgent = context.request.headers.get("user-agent")
    console.log("userAgent:", userAgent);
    return false
};
