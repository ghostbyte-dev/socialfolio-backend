import { Router } from "@oak/oak/router";
import { UserController } from "../controllers/user.controller.ts";
import { authMiddleware } from "../utils/AuthMiddleware.ts";

const userRouter = new Router();

userRouter.use(authMiddleware);

userRouter.get("/self", UserController.self);

export default userRouter;