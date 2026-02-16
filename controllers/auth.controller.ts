import { Context } from "@oak/oak/context";
import {
  AuthResponseDto,
  LoginRequestDto,
  RegisterRequestDto,
} from "../types/auth.types.ts";
import { AuthService } from "../services/auth.service.ts";
import { HttpError } from "../utils/HttpError.ts";
import { UserService } from "../services/user.service.ts";
import { RouterContext } from "@oak/oak/router";
import { VERIFY_ROUTE } from "../routes/auth.routes.ts";
import { JwtUtils } from "../utils/jwt.ts";

export class AuthController {
  static async login(context: Context): Promise<void> {
    const loginRequest = await context.request.body.json() as LoginRequestDto;
    try {
      const jwt = await AuthService.login(
        loginRequest.email,
        loginRequest.password,
      );
      const jwtPayload = await JwtUtils.verifyJWT(jwt);
      if (jwtPayload?.id == null) {
        throw new HttpError(500, "Invalid JWT");
      }
      const user = await UserService.getById(jwtPayload.id.toString());

      const authResponse = new AuthResponseDto(
        user._id,
        user.username,
        user.email,
        jwt,
      );

      context.response.status = 200;
      context.response.body = authResponse;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }

  static async register(context: Context) {
    const registerRequest = await context.request.body
      .json() as RegisterRequestDto;

    try {
      const jwt = await AuthService.register(
        registerRequest.email,
        registerRequest.username,
        registerRequest.password,
      );

      const jwtPayload = await JwtUtils.verifyJWT(jwt);
      if (jwtPayload?.id == null) {
        throw new HttpError(500, "Invalid JWT");
      }
      const user = await UserService.getById(jwtPayload.id.toString());

      const authResponse = new AuthResponseDto(
        user._id,
        user.username,
        user.email,
        jwt,
      );

      context.response.status = 201;
      context.response.body = authResponse;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }

  static async verify(context: RouterContext<typeof VERIFY_ROUTE>) {
    const code = context.params.code;
    if (!code) {
      context.response.status = 400;
      context.response.body = { message: "Verification code is required" };
      return;
    }
    try {
      await AuthService.verify(code);
      context.response.status = 200;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }

  static async requestPasswordReset(context: Context) {
    try {
      const body = await context.request.body.json();
      const email = body?.email;
      if (!email) throw new HttpError(400, "Email is Required");
      await AuthService.requestPasswordReset(email);
      context.response.status = 200;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }

  static async resetPassword(context: Context) {
    try {
      const body = await context.request.body.json();
      const token = body?.token;
      const newPassword = body?.password;
      if (!token || !newPassword) {
        throw new HttpError(400, "Token and Password are required");
      }
      await AuthService.resetPassword(token, newPassword);
      context.response.status = 200;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }

  static async resendVerificationCode(context: Context) {
    const userId = context.state.user?.id;
    try {
      await AuthService.resendVerificationCode(userId);
      context.response.status = 200;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }
}
