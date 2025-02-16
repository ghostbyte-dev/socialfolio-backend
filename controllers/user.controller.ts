import { Context } from "@oak/oak/context";
import { IUser } from "../model/User.ts";
import { UserService } from "../services/user.service.ts";
import { UserDto } from "../types/user.types.ts";
import { HttpError } from "../utils/HttpError.ts";
import { RouterContext } from "@oak/oak/router";
import { GET_BY_USERNAME_ROUTE } from "../routes/user.routes.ts";

export class UserController {
  static async self(context: Context) {
    const userId = context.state.user.id;
    try {
      const user: IUser = await UserService.getById(userId);
      const userDto = UserDto.fromUser(user);

      context.response.status = 200;
      context.response.body = userDto;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }

  static async getByUsername(
    context: RouterContext<typeof GET_BY_USERNAME_ROUTE>,
  ) {
    const username = context.params.username;
    if (!username) {
      context.response.status = 400;
      context.response.body = { message: "Username is required" };
      return;
    }

    try {
      const user: IUser = await UserService.getByUsername(username);
      const userDto = UserDto.fromUser(user);
      context.response.status = 200;
      context.response.body = userDto;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }

  static async updateUsername(context: Context) {
    const userId = context.state.user.id;
    const { username } = await context.request.body.json();
    if (!username) {
      context.response.status = 400;
      context.response.body = { message: "Username is required" };
      return;
    }

    try {
      const user: IUser = await UserService.updateUsername(userId, username);
      const userDto = UserDto.fromUser(user);
      context.response.status = 200;
      context.response.body = userDto;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }

  static async updateDescription(context: Context) {
    const userId = context.state.user.id;
    const { description } = await context.request.body.json();
    if (!description && description != "") {
      context.response.status = 400;
      context.response.body = { message: "Description is required" };
      return;
    }

    try {
      const user: IUser = await UserService.updateDescription(
        userId,
        description,
      );
      const userDto = UserDto.fromUser(user);
      context.response.status = 200;
      context.response.body = userDto;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }

  static async updateDisplayName(context: Context) {
    const userId = context.state.user.id;
    const { displayname } = await context.request.body.json();
    if (!displayname) {
      context.response.status = 400;
      context.response.body = { message: "Displayname is required" };
      return;
    }

    try {
      const user: IUser = await UserService.updateDisplayName(
        userId,
        displayname,
      );
      const userDto = UserDto.fromUser(user);
      context.response.status = 200;
      context.response.body = userDto;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }

  static async uploadAvatar(context: Context) {
    const userId = context.state.user.id;
    try {
      const body = context.request.body;
      const form = await body.formData();
      const file = form.get("avatar") as File;
      const user: IUser = await UserService.uploadAvatar(
        file,
        userId,
        context.request.url.origin,
      );
      const userDto = UserDto.fromUser(user);
      context.response.status = 200;
      context.response.body = userDto;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }

  static async deleteAvatar(context: Context) {
    const userId = context.state.user.id;
    try {
      const user: IUser = await UserService.deleteAvatar(
        userId,
      );
      const userDto = UserDto.fromUser(user);
      context.response.status = 200;
      context.response.body = userDto;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }
}
