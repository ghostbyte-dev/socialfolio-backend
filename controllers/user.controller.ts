import { UserService } from "../services/user.service.ts";
import { UserResponse } from "../types/user.types.ts";
import { HttpError } from "../utils/HttpError.ts";

export class UserController {
    static async self(context: any) {
        const userId = context.state.user.id
        try {
            const user: UserResponse = await UserService.self(userId);
            context.response.status = 200;
            context.response.body = user 
        } catch (error) {
            HttpError.handleError(context, error);
        }
    }
}