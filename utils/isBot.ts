import { RouterContext } from "@oak/oak/router";
import { GET_BY_USERNAME_ROUTE } from "../routes/user.routes.ts";
const BOT_UA_REGEX =
  /(bot|crawler|spider|crawling|googlebot|bingbot|yandex|duckduckbot|baiduspider|facebookexternalhit|twitterbot|slackbot|discordbot)/i;

export const isBot = (
  context: RouterContext<typeof GET_BY_USERNAME_ROUTE>,
): boolean => {
  const userAgent = context.request.headers.get("user-agent");
  if (!userAgent) return true; // No UA → very likely bot

  console.log("userAgent:", userAgent);
  return BOT_UA_REGEX.test(userAgent);
};
