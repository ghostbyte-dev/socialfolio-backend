import { RouterContext } from "@oak/oak/router";
import { GET_BY_USERNAME_ROUTE } from "../routes/user.routes.ts";
import { botRequestCounter } from "../main.ts";
import { isBot as uaParserIsBot } from "ua-parser-js/bot-detection";
import { UAParser } from "ua-parser-js";

export const isBot = (
  context: RouterContext<typeof GET_BY_USERNAME_ROUTE>,
): boolean => {
  const userAgent = context.request.headers.get("user-agent");
  if (!userAgent) {
    botRequestCounter.add(1, { reason: "no_user_agent" });
    return true;
  }
  if (userAgent === "node") {
    botRequestCounter.add(1, { agent: "node" });

    return false;
  }

  const isBot = uaParserIsBot(userAgent);

  if (isBot) {
    const parser = new UAParser(userAgent);
    const browserResult = parser.getBrowser();

    const botName = browserResult.name || "Generic Bot";

    botRequestCounter.add(1, {
      agent: botName,
      type: "regex_match",
    });
  }

  return isBot;
};
