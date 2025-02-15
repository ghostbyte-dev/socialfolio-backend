import { IGithub } from "../../model/Widget.ts";
import {
  ContributionsCollection,
  GithubData,
} from "../../types/widgetdata.types.ts";
import { WidgetDataService } from "./widgetdata.service.ts";

export class GithubService implements WidgetDataService<IGithub, GithubData> {
  async fetchData(input: IGithub): Promise<GithubData> {
    console.log(input.username);
    const token = Deno.env.get("GITHUB_TOKEN");
    const headers = {
      "Authorization": `bearer ${token}`,
    };
    const [account, contributions] = await Promise.all([
      fetch("https://api.github.com/users/" + input.username, {
        headers: headers,
      }).then((res) => res.json()),
      this.fetchContributions(input.username),
    ]);

    return {
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
  }

  private async fetchContributions(
    username: string,
  ): Promise<ContributionsCollection> {
    const token = Deno.env.get("GITHUB_TOKEN");
    console.log(token);
    const headers = {
      "Authorization": `bearer ${token}`,
    };
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
    console.log(data);
    const contributionsCollection: ContributionsCollection =
      data.data.user.contributionsCollection.contributionCalendar;
    return contributionsCollection;
  }
}
