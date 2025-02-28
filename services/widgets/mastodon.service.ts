import { redisClient } from "../../database.ts";
import { IMastodon } from "../../model/Widget.ts";
import { MastodonData } from "../../types/widgetdata.types.ts";
import { WidgetDataService } from "./widgetdata.service.ts";

const CACHE_MASTODON_KEY = "mastodon:";

export class MastodonService
  implements WidgetDataService<IMastodon, MastodonData> {
  async fetchData(input: IMastodon): Promise<MastodonData> {
    const baseUrl = input.instance;
    const username = input.username;

    const cachedData = await redisClient.get(
      this.getCacheKey(baseUrl, username),
    );

    if (cachedData) {
      return JSON.parse(cachedData) as MastodonData;
    }

    const res = await fetch(
      `${baseUrl}/api/v1/accounts/lookup?acct=` + username,
    );

    const account = await res.json();

    const mastodonData: MastodonData = {
      username: account.username,
      displayName: account.display_name,
      description: account.note,
      avatar: account.avatar,
      followersCount: account.followers_count,
      followingCount: account.following_count,
      statusesCount: account.statuses_count,
      url: account.url,
    };

    await redisClient.setEx(
      this.getCacheKey(baseUrl, username),
      86400,
      JSON.stringify(mastodonData),
    );

    return mastodonData;
  }

  private getCacheKey(baseUrl: string, username: string): string {
    return CACHE_MASTODON_KEY + baseUrl + "/" + username;
  }
}
