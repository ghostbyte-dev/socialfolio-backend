import { IPixlfed } from "../../model/Widget.ts";
import { PixelfedData } from "../../types/widgetdata.types.ts";
import { WidgetDataService } from "./widgetdata.service.ts";

export class PixelfedService
  implements WidgetDataService<IPixlfed, PixelfedData> {
  fetchData(input: IPixlfed): Promise<PixelfedData> {
    return new Promise((resolve) => {
      const pixelfedData: PixelfedData = {
        description: "hallo description",
        username: input.username,
      };
      resolve(pixelfedData);
    });
  }
}
