import { redisClient } from "../../database.ts";
import { IWeather } from "../../types/widget.types.ts";
import { WeatherData } from "../../types/widgetdata.types.ts";
import { WidgetDataService } from "./widgetdata.service.ts";

const CACHE_WEATHER_KEY = "weather:";

export class WeatherService
  implements WidgetDataService<IWeather, WeatherData> {
  async fetchData(input: IWeather): Promise<WeatherData> {
    const cachedData = await redisClient.get(
      this.getCacheKey(input.lat, input.lon),
    );

    if (cachedData) {
      return JSON.parse(cachedData) as WeatherData;
    }

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${input.lat}&longitude=${input.lon}&current=weather_code,is_day`,
    );

    const weatherData = await res.json();

    const mastodonData: WeatherData = {
      elevation: weatherData.elevation,
      current: {
        weatherCode: weatherData.current.weather_code,
      },
      isDay: Boolean(weatherData.current.is_day)
    };

    await redisClient.setEx(
      this.getCacheKey(input.lat, input.lon),
      3600,
      JSON.stringify(mastodonData),
    );

    return mastodonData;
  }

  private getCacheKey(lat: number, lon: number): string {
    return CACHE_WEATHER_KEY + "/" + lat + "-" + lon;
  }
}
