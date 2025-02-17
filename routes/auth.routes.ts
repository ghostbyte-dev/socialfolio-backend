import { Router } from "@oak/oak/router";
import { AuthController } from "../controllers/auth.controller.ts";

const authRouter = new Router();

authRouter.post("/login", AuthController.login);
authRouter.post("/register", AuthController.register);
export const VERIFY_ROUTE = "/verify/:code";
authRouter.post(VERIFY_ROUTE, AuthController.verify);

authRouter.post("/password/request", AuthController.requestPasswordReset);
authRouter.post("/password/reset", AuthController.resetPassword);

export default authRouter;
