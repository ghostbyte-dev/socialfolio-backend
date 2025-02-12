import { IUser } from "../model/User.ts";
import { UserService } from "../services/user.service.ts";
import { UserDto } from "../types/user.types.ts";
import { HttpError } from "../utils/HttpError.ts";

export class UserController {
    static async self(context: any) {
        const userId = context.state.user.id
        try {
            const user: IUser = await UserService.self(userId);
            const userDto = UserDto.fromUser(user);
            context.response.status = 200;
            context.response.body = userDto;
        } catch (error) {
            HttpError.handleError(context, error);
        }
    }
}