import { Context } from "@oak/oak/context";
import { AuthResponseDto, LoginRequestDto, RegisterRequestDto } from "../types/auth.types.ts";
import { AuthService } from "../services/auth.service.ts";
import { HttpError } from "../utils/HttpError.ts";
import { verifyJWT } from "../utils/jwt.ts";
import { UserService } from "../services/user.service.ts";

export class AuthController {
    static async login(context: Context): Promise<void> {
        const loginRequest = await context.request.body.json() as LoginRequestDto;
        try {
            const jwt = await AuthService.login(loginRequest.email, loginRequest.password);
            const jwtPayload = await verifyJWT(jwt);
            if (jwtPayload?.id == null) {
                throw new HttpError(500, "Invalid JWT");
            }
            const user = await UserService.getById(jwtPayload.id.toString());
            
            const authResponse = new AuthResponseDto(user._id, user.username, user.email, jwt);

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

            const jwtPayload = await verifyJWT(jwt);
            if (jwtPayload?.id == null) {
                throw new HttpError(500, "Invalid JWT");
            }
            const user = await UserService.getById(jwtPayload.id.toString());

            const authResponse = new AuthResponseDto(user._id, user.username, user.email, jwt);

            context.response.status = 201;
            context.response.body = authResponse;
        } catch (error) {
            HttpError.handleError(context, error);
        }
    }
}
