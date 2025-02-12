import { UserDto } from "./user.types.ts";

export class LoginRequestDto {
    constructor(
        public email: string,
        public password: string
    ) {}
}

export class RegisterRequestDto {
    constructor(
        public email: string,
        public username: string,
        public password: string
    ) {}
}

export class AuthResponseDto {
    constructor(
        public user: UserDto,
        public jwt?: string
    ) {}
}
