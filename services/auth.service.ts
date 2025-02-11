import Profile from "../model/Profile.ts";
import { HttpError } from "../utils/HttpError.ts";
import { createJWT } from "../utils/jwt.ts";
import * as bcrypt from "bcrypt";

export class AuthService {
    static async register(email: string, username: string, password: string): Promise<string> {
        const existingProfile = await Profile.findOne({ email });
        if (existingProfile) throw new HttpError(401, "Email already exists");

        const hashedPassword = await bcrypt.hash(password);
        const newProfile = await Profile.create({ email, username, password: hashedPassword });

        return createJWT({ id: newProfile._id.toString() });
    }

    static async login(email: string, password: string): Promise<string> {
        const profile = await Profile.findOne({ email });
        if (!profile) throw new HttpError(401, "Invalid Email");

        const isMatch = await bcrypt.compare(password, profile.password);
        if (!isMatch) throw new HttpError(401, "Invalid Password");

        return createJWT({ id: profile._id.toString() });
    }
}