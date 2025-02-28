import { IWidgetsData } from "../../types/widget.types.ts";
import { WidgetData } from "../../types/widgetdata.types.ts";
import { WidgetDataService } from "./widgetdata.service.ts";

export class DefaultWidgetService
  implements WidgetDataService<IWidgetsData, WidgetData> {
  fetchData(input: IWidgetsData): Promise<WidgetData> {
    return new Promise((resolve) => {
      resolve(input)
    });
  }
}
