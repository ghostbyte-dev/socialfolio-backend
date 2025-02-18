import { RouterContext } from "@oak/oak/router";
import { ExploreService } from "../services/explore.service.ts";
import { IExploreProfile } from "../model/ExploreUser.ts";
import { HttpError } from "../utils/HttpError.ts";
import { Context } from "@oak/oak/context";

export class ExploreController {

static async getExploreProfiles(
    context: Context,
  ) {
    //const offset = context.params.offset ?? 0;

    try {
      const profiles: IExploreProfile[] = await ExploreService.getExploreProfiles();
      context.response.status = 200;
      context.response.body = profiles;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }
}