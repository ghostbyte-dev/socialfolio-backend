import { Context } from "@oak/oak/context";
import { verifyJWT } from "./jwt.ts";

export const authMiddleware = async (
  context: Context,
  next: () => Promise<unknown>,
) => {
  const token = context.request.headers.get("Authorization");
  if (!token) {
    context.response.status = 401;
    context.response.body = { message: "Unauthorized" };
    return;
  }
  try {
    const jwtPayload = await verifyJWT(token);
    if (jwtPayload == null) {
      throw new Error("Invalid JWT");
    }
    context.state.user = jwtPayload;
    if (context.state.user.id == null) {
      throw new Error("Invalid JWT");
    }
    await next();
  } catch (_error: unknown) {
    context.response.status = 401;
    context.response.body = { message: "Unauthorized" };
  }
};
