import { redisClient } from "../../database.ts";
import { ApodData } from "../../types/widgetdata.types.ts";
import { WidgetDataService } from "./widgetdata.service.ts";

const CACHE_APOD_KEY = "apod:";

export class ApodService implements WidgetDataService<null, ApodData> {
  async fetchData(): Promise<ApodData> {
    const cachedData = await redisClient.get(
      this.getCacheKey(),
    );

    if (cachedData) {
      return JSON.parse(cachedData) as ApodData;
    }
    const token = Deno.env.get("APOD_TOKEN");

    const res = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${token}`,
    );

    const data = await res.json();

    const apodData: ApodData = {
      url: data.url,
    };

    await redisClient.setEx(
      this.getCacheKey(),
      14400,
      JSON.stringify(apodData),
    );

    return apodData;
  }

  private getCacheKey(): string {
    const dateStr = new Date().toISOString().split("T")[0];
    return `${CACHE_APOD_KEY}:${dateStr}`;
  }
}
