import { IUser } from "../model/User.ts";

export class UserDto {
    constructor(
        public id: string,
        public username: string,
        public email: string,
    ) {}

    static fromUser(user: IUser): UserDto {
        return new UserDto(user._id, user.username, user.email);
    }
}