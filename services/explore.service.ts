import {
  ExploreOrder,
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
    filter: ExploreOrder,
  ): Promise<IExploreProfilesResponse> {
    const parsedLimit = parseInt(limit as string, 10);

    const query: FilterQuery<IUser> = { status: Status.Visible };

    const profiles = filter === ExploreOrder.LATEST
      ? await this.getProfilesLatest(query, parsedLimit, cursor)
      : await this.getProfilesPopular(query, parsedLimit, cursor);

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
    cursor: string | null,
  ): Promise<IUser[]> {
    if (cursor && mongoose.isValidObjectId(cursor as string)) {
      query._id = { $lt: new mongoose.Types.ObjectId(cursor as string) };
    }

    const profiles = await User.find(query).sort({ _id: -1 }).limit(
      parsedLimit,
    );
    return profiles;
  }

  static async getProfilesPopular(
    query: FilterQuery<IUser>,
    parsedLimit: number,
    cursor: string | null,
  ): Promise<IUser[]> {
    let viewCountThreshold = Infinity;
    let cursorId: mongoose.Types.ObjectId | null = null;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    if (cursor && mongoose.isValidObjectId(cursor)) {
      cursorId = new mongoose.Types.ObjectId(cursor);
      const pivot = await User.aggregate([
        { $match: { _id: cursorId } },
        {
        $lookup: {
          from: "views",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$profileId", "$$userId"] },
                    { $gte: ["$timestamp", twentyFourHoursAgo] },
                  ],
                },
              },
            },
          ],
          as: "viewData",
        },
      },
        { $addFields: { count: { $size: "$viewData" } } },
      ]);
      if (pivot.length > 0) {
        viewCountThreshold = pivot[0].count;
      }
    }
    const profiles = await User.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "views",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$profileId", "$$userId"] },
                    { $gte: ["$timestamp", twentyFourHoursAgo] },
                  ],
                },
              },
            },
          ],
          as: "viewData",
        },
      },
      {
        $addFields: {
          viewCount: { $size: "$viewData" },
        },
      },
      ...(cursorId
        ? [{
          $match: {
            $or: [
              { viewCount: { $lt: viewCountThreshold } },
              { viewCount: viewCountThreshold, _id: { $lt: cursorId } },
            ],
          },
        }]
        : []),
      { $sort: { viewCount: -1, _id: -1 } },

      { $limit: parsedLimit },

      { $project: { viewData: 0 } },
    ]);
    return profiles;
  }
}
