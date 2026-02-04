import { RouterContext } from "@oak/oak/router";
import { GET_BY_USERNAME_ROUTE } from "../routes/user.routes.ts";
import { botRequestCounter } from "../main.ts";
const BOT_UA_REGEX =
  /(bot|crawler|spider|crawling|googlebot|bingbot|yandex|duckduckbot|baiduspider|facebookexternalhit|twitterbot|slackbot|discordbot|node)/i;


export const isBot = (
  context: RouterContext<typeof GET_BY_USERNAME_ROUTE>,
): boolean => {
  const userAgent = context.request.headers.get("user-agent");
  if (!userAgent) {
    botRequestCounter.add(1, { reason: "no_user_agent" });
    return true;
  }

  const result = BOT_UA_REGEX.test(userAgent);
  if (result) {
    botRequestCounter.add(1, { 
      agent: userAgent.split('/')[0],
      type: "regex_match" 
    });
  }

  return result;
};
