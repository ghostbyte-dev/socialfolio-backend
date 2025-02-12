import { Context } from "@oak/oak/context";
import { IUser } from "../model/User.ts";
import { UserService } from "../services/user.service.ts";
import { UserDto } from "../types/user.types.ts";
import { HttpError } from "../utils/HttpError.ts";
import { RouterContext } from "@oak/oak/router";
import { GET_BY_USERNAME_ROUTE } from "../routes/user.routes.ts";

export class UserController {
    static async self(context: Context) {
        const userId = context.state.user.id
        try {
            const user: IUser = await UserService.getById(userId);
            const userDto = UserDto.fromUser(user);
            context.response.status = 200;
            context.response.body = userDto;
        } catch (error) {
            HttpError.handleError(context, error);
        }
    }

    /*static getByUsername = ({ params, response }: { params: { id: string }, response: any }) => {
        response.status = 200;
        response.body = { message: params.id };
    }*/

    static async getByUsername(context: RouterContext<typeof GET_BY_USERNAME_ROUTE>) {
       const username = context.params.username;
       console.log(username);
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
}