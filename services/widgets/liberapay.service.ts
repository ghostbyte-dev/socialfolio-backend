import { ILiberaPay } from "../../model/Widget.ts";
import { LiberapayData } from "../../types/widgetdata.types.ts";
import { WidgetDataService } from "./widgetdata.service.ts";

export class LiberapayServie
  implements WidgetDataService<ILiberaPay, LiberapayData> {
  fetchData(input: ILiberaPay): Promise<LiberapayData> {
    const timeData: LiberapayData = {
      username: input.username,
    };
    return Promise.resolve(timeData);
  }
}
