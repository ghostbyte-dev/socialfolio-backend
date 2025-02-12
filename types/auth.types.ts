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
        public message: string,
        public jwt?: string
    ) {}
}
