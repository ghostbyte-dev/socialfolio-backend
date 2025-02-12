import { IMastodon, IPixlfed } from "../../model/Widget.ts";
import { MastodonData, PixelfedData } from "../../types/widgetdata.types.ts";
import { WidgetDataService } from "./widgetdata.service.ts";

export class MastodonService implements WidgetDataService<IMastodon, MastodonData> {
  fetchData(input: IMastodon): Promise<MastodonData> {
    return new Promise((resolve) => {
        const pixelfedData: MastodonData = {
            description: "hallo description mastodon",
            username: input.username
        }
        resolve(pixelfedData);
    });
  }                                                                                        
}