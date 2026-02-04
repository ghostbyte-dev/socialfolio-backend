import { redisClient } from "../../database.ts";
import { IPixelfed } from "../../types/widget.types.ts";
import { PixelfedData, PixelfedPost } from "../../types/widgetdata.types.ts";
import { WidgetDataService } from "./widgetdata.service.ts";

const CACHE_PIXELFED_KEY = "pixelfed:";

export class PixelfedService
  implements WidgetDataService<IPixelfed, PixelfedData> {
  async fetchData(input: IPixelfed): Promise<PixelfedData> {
    const baseUrl = input.instance;
    const accountId = input.accountId;

    if (!accountId) {
      throw new Error("You have to enter your Account Id for this variant");
    }

    const cachedData = await redisClient.get(
      this.getCacheKey(baseUrl, accountId),
    );

    if (cachedData) {
      return JSON.parse(cachedData) as PixelfedData;
    }
    let pixelfedData: PixelfedData;
    try {
      const res = await fetch(
        `${baseUrl}/api/pixelfed/v1/accounts/${accountId}/statuses`,
      );
      const json = await res.json();
      const posts: PixelfedPost[] = json.map((post: any) => ({
        id: post.id,
        url: post.url,
      }));
      {
        posts;
      }
      pixelfedData = { posts };
      await redisClient.setEx(
        this.getCacheKey(baseUrl, accountId),
        86400,
        JSON.stringify(pixelfedData),
      );
    } catch (_e) {
      throw new Error("Unable to fetch Pixelfed Posts");
    }

    return pixelfedData;
  }

  private getCacheKey(baseUrl: string, accountId: string): string {
    return CACHE_PIXELFED_KEY + baseUrl + "/" + accountId;
  }
}
