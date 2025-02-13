import { IGithub } from "../../model/Widget.ts";
import { GithubData } from "../../types/widgetdata.types.ts";
import { WidgetDataService } from "./widgetdata.service.ts";

export class GithubService implements WidgetDataService<IGithub, GithubData> {
  async fetchData(input: IGithub): Promise<GithubData> {
    console.log(input.username);
    const res = await fetch(
      "https://api.github.com/users/" + input.username,
    );
    const account = await res.json();
    console.log(account);
    return {
      username: account.login,
      name: account.name,
      avatar: account.avatar_url,
      followers: account.followers,
      following: account.following,
      location: account.location,
      publicRepos: account.public_repos,
      url: account.url,
    };
  }
}
