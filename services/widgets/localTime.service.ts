import { ILocalTime } from "../../model/Widget.ts";
import { LocalTimeData } from "../../types/widgetdata.types.ts";
import { WidgetDataService } from "./widgetdata.service.ts";

export class LocalTimeService
  implements WidgetDataService<ILocalTime, LocalTimeData> {
  fetchData(input: ILocalTime): Promise<LocalTimeData> {
    const timeData: LocalTimeData = {
      timeZone: input.timezone,
    };
    return Promise.resolve(timeData);
  }
}
