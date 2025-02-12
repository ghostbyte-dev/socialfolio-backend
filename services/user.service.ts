import User, { IUser } from "../model/User.ts";
import { HttpError } from "../utils/HttpError.ts";

export class UserService {
    static async getById(id: string): Promise<IUser> {
        const profile = await User.findOne({ _id: id });
        if (!profile) {
            throw new HttpError(404, "Profile not found");
        }
        return profile;
    }

    static async getByUsername(username: string): Promise<IUser> {
        const profile = await User.findOne({
            username: username,
        });
        if (!profile) {
            throw new HttpError(404, "Profile not found");
        }
        return profile;
    }
}