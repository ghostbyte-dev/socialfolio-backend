import { StatsService } from "../services/stats.service.ts";
import { IStats } from "../types/stats.types.ts";
import { HttpError } from "../utils/HttpError.ts";
import { Context } from "@oak/oak/context";

export class StatsController {

static async getStats(
    context: Context,
  ) {
    try {
      const stats: IStats = await StatsService.getStats();
      context.response.status = 200;
      context.response.body = stats;
    } catch (error) {
      HttpError.handleError(context, error);
    }
  }
}