import crypto from "node:crypto";
import { redisClient } from "../database.ts";
import View from "../model/View.ts";
import { uniqueProfileClicks } from "../main.ts";

export class ViewService {
  static async recordView(profileId: string, ip: string) {
    const hash = this.hashIpAndProfileId(ip, profileId);
    const redisKey = `view_v2_${hash}`;

    const isNewView = await redisClient.set(redisKey, "1", {
      NX: true,
      EX: 86400,
    });

    if (isNewView === "OK") {
      await View.create({
        timestamp: new Date(),
        profileId: profileId,
      });
      uniqueProfileClicks.add(1);
    }
  }

  static hashIpAndProfileId(ip: string, profileId: string) {
    const salt = Deno.env.get("VIEWS_SALT");
    return crypto
      .createHash("sha256")
      .update(`${ip}-${profileId}-${salt}`)
      .digest("hex");
  }

  static async getViewsOfProfile(profileId: string): Promise<number> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const viewsCount = await View.countDocuments({
      profileId: profileId,
      timestamp: { $gte: twentyFourHoursAgo },
    });
    return viewsCount;
  }
}
