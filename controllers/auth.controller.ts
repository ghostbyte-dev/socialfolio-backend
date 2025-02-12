import { Context } from "@oak/oak/context";
import { AuthResponseDto, LoginRequestDto, RegisterRequestDto } from "../types/auth.types.ts";
import { AuthService } from "../services/auth.service.ts";
import { HttpError } from "../utils/HttpError.ts";

export class AuthController {
    static async login(context: Context): Promise<void> {
        const loginRequest = await context.request.body.json() as LoginRequestDto;
        try {
            const jwt = await AuthService.login(loginRequest.email, loginRequest.password);
            const authResponse = new AuthResponseDto("Login successful", jwt);

            context.response.status = 200;
            console.log("success");
            context.response.body = authResponse;
        } catch (error) {
            console.log("error");

            HttpError.handleError(context, error);
        }
    }

    static async register(context: Context) {
        const registerRequest = await context.request.body.json() as RegisterRequestDto;

        try {
            const jwt = await AuthService.register(registerRequest.email, registerRequest.username, registerRequest.password);
            const authResponse = new AuthResponseDto("Register successful", jwt);
            
            context.response.status = 201;
            context.response.body = authResponse;
        } catch (error) {
            HttpError.handleError(context, error);
        }
    }
}
