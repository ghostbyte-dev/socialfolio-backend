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
        public id: string,
        public username: string,
        public email: string,
        public jwt: string
    ) {}
}
