import { Context } from "@oak/oak/context";

export class HttpError extends Error {
    public status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        Object.setPrototypeOf(this, new.target.prototype);
    }

    static handleError(context: Context, error: unknown) {
        if (error instanceof this) {
            context.response.status = error.status;
            context.response.body = { message: error.message };
        } else if (error instanceof Error) {
            context.response.status = 500;
            context.response.body = { message: error.message };
        } else {
            context.response.status = 500;
            context.response.body = { message: "An unknown error occurred" };
        }
    }
}


