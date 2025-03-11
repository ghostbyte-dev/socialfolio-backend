import { ExploreService } from "../services/explore.service.ts";
import { IExploreProfilesResponse } from "../types/explore.types.ts";
import { HttpError } from "../utils/HttpError.ts";
import { Context } from "@oak/oak/context";

export class ExploreController {
  static async getExploreProfiles(
    context: Context,
  ) {
    const cursor: string | null = context.request.url.searchParams.get(
      "cursor",
    );
    const limit: string | null = context.request.url.searchParams.get("limit");
    try {
      const profiles: IExploreProfilesResponse = await ExploreService
        .getExploreProfiles(cursor, limit);
      context.response.status = 200;
      context.response.body = profiles;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }
}
