import { IUser, Status } from "../model/User.ts";

export class UserDto {
  constructor(
    public id: string,
    public username: string,
    public email: string,
    public displayName: string,
    public description: string,
    public avatar: string,
    public status: Status,
    public views: number | undefined
  ) {}

  static fromUser(user: IUser, views?: number): UserDto {
    return new UserDto(
      user._id,
      user.username,
      user.email,
      user.displayName ?? "",
      user.description ?? "",
      user.avatarUrl ?? "",
      user.status,
      views ?? undefined
    );
  }
}
