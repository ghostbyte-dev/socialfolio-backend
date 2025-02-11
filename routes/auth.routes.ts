import { Router } from "@oak/oak/router";
import { AuthController } from "../controllers/auth.controller.ts";

const authRouter = new Router();

authRouter.post("/login", AuthController.login);
authRouter.post("/register", AuthController.register);

export default authRouter;