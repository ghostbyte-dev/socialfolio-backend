import { ExploreService } from "../services/explore.service.ts";
import {
  ExploreFilter,
  IExploreProfilesResponse,
} from "../types/explore.types.ts";
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
    const rawFilter = context.request.url.searchParams.get("filter");

    // Check if the raw string exists in the enum's values
    const filter: ExploreFilter =
      Object.values(ExploreFilter).includes(rawFilter as ExploreFilter)
        ? (rawFilter as ExploreFilter)
        : ExploreFilter.LATEST;

    try {
      const profiles: IExploreProfilesResponse = await ExploreService
        .getExploreProfiles(cursor, limit, filter);
      context.response.status = 200;
      context.response.body = profiles;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }
}
