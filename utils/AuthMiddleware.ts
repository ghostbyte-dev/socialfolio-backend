import { verifyJWT } from "./jwt.ts";

export const authMiddleware = async (context: any, next: any) => {
    const token = context.request.headers.get("Authorization");
    if (!token) {
        context.response.status = 401;
        context.response.body = { message: "Unauthorized" };
        return;
    }
    try {
        const jwtPayload = await verifyJWT(token);
        if (jwtPayload == null) {
            throw new Error("Invalid JWT");
        }
        context.state.user = jwtPayload;
        await next();
    } catch (error) {
        context.response.status = 401;
        context.response.body = { message: "Unauthorized" };
    }
}