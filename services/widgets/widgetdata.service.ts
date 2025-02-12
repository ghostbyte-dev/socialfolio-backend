import { WidgetType } from "../../model/Widget.ts";
import { WidgetData } from "../../types/widgetdata.types.ts";
import { MastodonService } from "./mastodon.service.ts";
import { PixelfedService } from "./pixelfed.service.ts";

export interface WidgetDataService<TInput, TOutput extends WidgetData> {
  fetchData(input: TInput): Promise<TOutput>;
}

export class WidgetDataServiceFactory {
  static createService<TInput, TOutput extends WidgetData>(
    type: WidgetType,
  ): WidgetDataService<TInput, TOutput> {
    switch (type) {
      case WidgetType.Mastodon:
        return new MastodonService() as unknown as WidgetDataService<
          TInput,
          TOutput
        >;
      case WidgetType.Pixelfed:
        return new PixelfedService() as unknown as WidgetDataService<
          TInput,
          TOutput
        >;
      default:
        throw new Error(`Unsupported widget type: ${type}`);
    }
  }
}
