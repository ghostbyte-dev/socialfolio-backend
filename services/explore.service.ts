import { IExploreProfile, IExploreProfilesResponse } from "../types/explore.types.ts";
import User, { IUser } from '../model/User.ts'; // Ensure you have IUser defined
import { HttpError } from "../utils/HttpError.ts";
import mongoose from "mongoose";
import { FilterQuery } from "mongoose";

export class ExploreService {
    static async getExploreProfiles(cursor: string | null, limit: string | null): Promise<IExploreProfilesResponse> {
        const parsedLimit = parseInt(limit as string, 10); 

        const query: FilterQuery<IUser>= { verified: true };

        if (cursor && mongoose.isValidObjectId(cursor as string)) {
            query._id = { $lt: new mongoose.Types.ObjectId(cursor as string) };
        }

        const profiles = await User.find(query).sort({createdAt: -1}).limit(parsedLimit);

        if (!profiles) {
            throw new HttpError(404, "No profiles found");
        }

        const exploreProfiles: IExploreProfile[] = profiles.map((user) => ({
            id: user._id.toString(),
            username: user.username,
            avatar: user.avatarUrl || "",
            displayName: user.displayName || "",
            description: user.description || "",
            createdAt: user.createdAt
        }));

        const nextCursor = profiles.length ? profiles[profiles.length - 1]._id.toString() : null;
        const response: IExploreProfilesResponse = {
            nextCursor: nextCursor,
            profiles: exploreProfiles
        }
        return response;
    }
}