import { IUser } from "../model/User.ts";

export class UserDto {
    constructor(
        public username: string,
        public email: string,
    ) {}

    static fromUser(user: IUser): UserDto {
        return new UserDto(user.username, user.email);
    }
}