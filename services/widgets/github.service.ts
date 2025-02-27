import { redisClient } from "../../database.ts";
import { IGithub } from "../../model/Widget.ts";
import {
  ContributionsCollection,
  GithubData,
} from "../../types/widgetdata.types.ts";
import { WidgetDataService } from "./widgetdata.service.ts";

const CACHE_GITHUB_KEY = "github:";

export class GithubService implements WidgetDataService<IGithub, GithubData> {
  async fetchData(input: IGithub): Promise<GithubData> {
    const cachedData = await redisClient.get(this.getCacheKey(input.username));

    if (cachedData) {
      return JSON.parse(cachedData) as GithubData;
    }

    const token = Deno.env.get("GITHUB_TOKEN");
    const headers = {
      "Authorization": `bearer ${token}`,
    };

    const [account, contributions] = await Promise.all([
      this.fetchUser(input.username, headers),
      this.fetchContributions(input.username, headers),
    ]);

    const githubData: GithubData = {
      username: account.login,
      name: account.name,
      avatar: account.avatar_url,
      followers: account.followers,
      following: account.following,
      location: account.location,
      publicRepos: account.public_repos,
      url: account.url,
      contributions,
    };

    await redisClient.setEx(
      this.getCacheKey(input.username),
      86400,
      JSON.stringify(githubData),
    );

    return githubData;
  }

  private getCacheKey(username: string): string {
    return CACHE_GITHUB_KEY + username;
  }

  private async fetchUser(username: string, headers: object) {
    const res = await fetch("https://api.github.com/users/" + username, {
      headers: headers,
    });
    return await res.json();
  }

  private async fetchContributions(
    username: string,
    headers: object,
  ): Promise<ContributionsCollection> {
    const body = {
      "query": `query {
              user(login: "${username}") {
                contributionsCollection {
                  contributionCalendar {
                    colors
                    totalContributions
                    weeks {
                      contributionDays {
                        color
                        contributionCount
                        date
                        weekday
                      }
                      firstDay
                    }
                  }
                }
              }
            }`,
    };
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      body: JSON.stringify(body),
      headers: headers,
    });
    const data = await response.json();
    const contributionsCollection: ContributionsCollection =
      data.data.user.contributionsCollection.contributionCalendar;
    return contributionsCollection;
  }
}
