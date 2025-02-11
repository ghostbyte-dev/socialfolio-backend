import { Router } from "@oak/oak/router";
import Profile from "../model/Profile.ts";
import { createJWT } from "../utils/jwt.ts";

const authController = new Router()
    .post("/login", async (context) => {
        const { email, password } = await context.request.body.json();
        const profile = await Profile.findOne({ email, password });
        if (profile) {
            const jwt = await createJWT({ id: profile._id });

            context.response.status = 200;
            context.response.body = { message: "Login successful", jwt };
        } else {
            context.response.status = 401;
            context.response.body = { message: "Invalid credentials" };
        }
    })

    .post("/register", async (context) => {
        const { email, username, password } = await context.request.body.json();
        const profile = await Profile.findOne({ email });
        if (profile) {
            context.response.status = 409;
            context.response.body = { message: "Email already exists" };
        } else {
            const newProfile = await Profile.create({
                email,
                username,
                password,
            });
            if (newProfile) {
                const jwt = await createJWT({ id: newProfile._id });
                context.response.status = 201;
                context.response.body = { 
                    message: "Profile created successfully",
                    jwt
                 };
            }
        }
    });  


export default authController;