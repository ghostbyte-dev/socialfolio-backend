import { Router } from "@oak/oak/router";
import { UserController } from "../controllers/user.controller.ts";
import {
  authMiddleware,
  getTokenPayloadMiddleware,
} from "../utils/AuthMiddleware.ts";

const unsecuredUserRouter = new Router();
unsecuredUserRouter.use(getTokenPayloadMiddleware);
export const GET_BY_USERNAME_ROUTE = "/username/:username";
unsecuredUserRouter.get(GET_BY_USERNAME_ROUTE, UserController.getByUsername);

const securedUserRouter = new Router();

securedUserRouter.use(authMiddleware);

securedUserRouter.get("/self", UserController.self);
securedUserRouter.put("/update/username", UserController.updateUsername);
securedUserRouter.put("/update/description", UserController.updateDescription);
securedUserRouter.put("/update/displayname", UserController.updateDisplayName);
securedUserRouter.put("/update/status", UserController.updateStatus);
securedUserRouter.post("/uploadAvatar", UserController.uploadAvatar);
securedUserRouter.delete("/avatar", UserController.deleteAvatar);
securedUserRouter.delete("/account", UserController.deleteAccount);

const userRouter = new Router();
userRouter.use(unsecuredUserRouter.routes());
userRouter.use(securedUserRouter.routes());

export default userRouter;
