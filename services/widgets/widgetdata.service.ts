import { WidgetData } from "../../types/widgetdata.types.ts";
import { MastodonService } from "./mastodon.service.ts";
import { WidgetType } from "../../types/widget.types.ts";
import { DefaultWidgetService } from "./defaultWidget.service.ts";
import { GithubService } from "./github.service.ts";
import { WeatherService } from "./weather.service.ts";
import { ApodService } from "./apod.service.ts";
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
      case WidgetType.Github:
        return new GithubService() as unknown as WidgetDataService<
          TInput,
          TOutput
        >;
      case WidgetType.Weather:
        return new WeatherService() as unknown as WidgetDataService<
          TInput,
          TOutput
        >;
      case WidgetType.Apod:
        return new ApodService() as unknown as WidgetDataService<
          TInput,
          TOutput
        >;
      default:
        return new DefaultWidgetService() as unknown as WidgetDataService<
          TInput,
          TOutput
        >;
    }
  }
}
