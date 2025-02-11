import { Context } from "@oak/oak/context";
import { LoginRequest, RegisterRequest } from "../types/auth.types.ts";
import { AuthService } from "../services/auth.service.ts";
import { HttpError } from "../utils/HttpError.ts";

export class AuthController {
    static async login(context: Context): Promise<void> {
        const loginRequest = await context.request.body.json() as LoginRequest;
        try {
            const jwt = await AuthService.login(loginRequest.email, loginRequest.password);

            context.response.status = 200;
            console.log("success");
            context.response.body = { message: "Login successful", jwt };
        } catch (error) {
            console.log("error");

            HttpError.handleError(context, error);
        }
    }

    static async register(context: Context) {
        const registerRequest = await context.request.body.json() as RegisterRequest;

        try {
            const jwt = await AuthService.register(registerRequest.email, registerRequest.username, registerRequest.password);

            context.response.status = 201;
            context.response.body = { message: "Register successful", jwt };
        } catch (error) {
            HttpError.handleError(context, error);
        }
    }
}
