import { Context } from "@oak/oak/context";
import { send } from "@oak/oak/send";

const ROOT_DIR = "./public", ROOT_DIR_PATH = "/public";

export const staticFileMiddleware = async (
  context: Context,
  next: () => Promise<unknown>,
) => {
  if (!context.request.url.pathname.startsWith(ROOT_DIR_PATH)) {
    await next();
    return;
  }
  const filePath = context.request.url.pathname.replace(ROOT_DIR_PATH, "");
  await send(context, filePath, {
    root: ROOT_DIR,
  });
};
