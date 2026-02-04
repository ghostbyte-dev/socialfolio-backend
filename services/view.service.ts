import crypto from "node:crypto";
import { redisClient } from "../database.ts";
import View from "../model/View.ts";

export class ViewService {
  static async recordView(profileId: string, ip: string) {
    console.log(ip);
    const hash = this.hashIpAndProfileId(ip, profileId);
    const data = await redisClient.get(`view_${hash}`);
    if (data === null) {
      console.log(hash, "save");
      await View.create({
        timestamp: new Date(),
        profileId: profileId,
      });
      await redisClient.set(`view_${hash}`, "1");
      await redisClient.setEx(
        `view_${hash}`,
        68400,
        "1",
      );
    }
  }

  static hashIpAndProfileId(ip: string, profileId: string) {
    const salt = Deno.env.get("VIEWS_SALT");
    return crypto
      .createHash("sha256")
      .update(`${ip}-${profileId}-${salt}`)
      .digest("hex");
  }
}
