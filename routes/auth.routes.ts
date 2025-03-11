import { Router } from "@oak/oak/router";
import { AuthController } from "../controllers/auth.controller.ts";
import { authMiddleware } from "../utils/AuthMiddleware.ts";

const authRouter = new Router();

authRouter.post("/login", AuthController.login);
authRouter.post("/register", AuthController.register);
export const VERIFY_ROUTE = "/verify/:code";
authRouter.post(VERIFY_ROUTE, AuthController.verify);

authRouter.post("/password/request", AuthController.requestPasswordReset);
authRouter.post("/password/reset", AuthController.resetPassword);

const securedRouter = new Router();
securedRouter.use(authMiddleware);
securedRouter.post(
  "/resendVerifiationCode",
  AuthController.resendVerificationCode,
);

authRouter.use(securedRouter.routes());
export default authRouter;
