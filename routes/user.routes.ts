import { Router } from "@oak/oak/router";
import { UserController } from "../controllers/user.controller.ts";
import { authMiddleware } from "../utils/AuthMiddleware.ts";

const userRouter = new Router();

export const GET_BY_USERNAME_ROUTE = "/username/:username";
userRouter.get(GET_BY_USERNAME_ROUTE, UserController.getByUsername);

userRouter.use(authMiddleware);

userRouter.get("/self", UserController.self);
userRouter.put("/update/username", UserController.updateUsername);
userRouter.put("/update/description", UserController.updateDescription);
userRouter.put("/update/displayname", UserController.updateDisplayName);
userRouter.post("/uploadAvatar", UserController.uploadAvatar);

export default userRouter;
