import {
  ExploreFilter,
  IExploreProfile,
  IExploreProfilesResponse,
} from "../types/explore.types.ts";
import User, { IUser, Status } from "../model/User.ts";
import { HttpError } from "../utils/HttpError.ts";
import mongoose from "mongoose";
import { FilterQuery } from "mongoose";

export class ExploreService {
  static async getExploreProfiles(
    cursor: string | null,
    limit: string | null,
    filter: ExploreFilter,
  ): Promise<IExploreProfilesResponse> {
    const parsedLimit = parseInt(limit as string, 10);

    const query: FilterQuery<IUser> = { status: Status.Visible };

    if (cursor && mongoose.isValidObjectId(cursor as string)) {
      query._id = { $lt: new mongoose.Types.ObjectId(cursor as string) };
    }

    const profiles = filter === ExploreFilter.LATEST
      ? await this.getProfilesLatest(query, parsedLimit)
      : await this.getProfilesPopular(query, parsedLimit);

    if (!profiles) {
      throw new HttpError(404, "No profiles found");
    }

    const exploreProfiles: IExploreProfile[] = profiles.map((user) => ({
      id: user._id.toString(),
      username: user.username,
      avatar: user.avatarUrl || "",
      displayName: user.displayName || "",
      description: user.description || "",
      createdAt: user.createdAt,
    }));

    const nextCursor = profiles.length
      ? profiles[profiles.length - 1]._id.toString()
      : null;
    const response: IExploreProfilesResponse = {
      nextCursor: nextCursor,
      profiles: exploreProfiles,
    };
    return response;
  }

  static async getProfilesLatest(
    query: FilterQuery<IUser>,
    parsedLimit: number,
  ): Promise<IUser[]> {
    const profiles = await User.find(query).sort({ _id: -1 }).limit(
      parsedLimit,
    );
    return profiles;
  }

  static async getProfilesPopular(
    query: FilterQuery<IUser>,
    parsedLimit: number,
  ): Promise<IUser[]> {
    const profiles = await User.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "views",
          localField: "_id",
          foreignField: "profileId",
          as: "viewData",
        },
      },
      {
        $addFields: {
          viewCount: { $size: "$viewData" },
        },
      },
      { $sort: { viewCount: -1, _id: -1 } },

      { $limit: parsedLimit },

      { $project: { viewData: 0 } },
    ]);
    return profiles;
  }
}
