import { Profiler } from "node:inspector/promises";
import Profile from "../model/Profile.ts";
import { UserResponse } from "../types/user.types.ts";
import { HttpError } from "../utils/HttpError.ts";

export class UserService {
    static async self(id: string): Promise<UserResponse> {
        const profile = await Profile.findOne({ _id: id });
        if (!profile) {
            throw new HttpError(404, "Profile not found");
        }
        const profileResponse: UserResponse = {
            username: profile.username,
            email: profile.email,
        };
        return profileResponse;
    }
}