import { IExploreProfile } from "../types/explore.types.ts";
import User from "../model/User.ts";
import { HttpError } from "../utils/HttpError.ts";


export class ExploreService {
    static async getExploreProfiles(): Promise<IExploreProfile[]> {
        const profiles = await User.find({verified: true}).limit(20);

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

        return exploreProfiles;
    }
}