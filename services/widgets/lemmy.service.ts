import { ILemmy } from "../../model/Widget.ts";
import { LemmyData } from "../../types/widgetdata.types.ts";
import { WidgetDataService } from "./widgetdata.service.ts";

export class LemmyService
  implements WidgetDataService<ILemmy, LemmyData> {
  fetchData(input: ILemmy): Promise<LemmyData> {
    return new Promise((resolve) => {
      const pixelfedData: LemmyData = {
        description: "hallo description",
        username: input.username,
      };
      resolve(pixelfedData);
    });
  }
}
