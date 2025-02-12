import User from "../model/User.ts";
import { HttpError } from "../utils/HttpError.ts";
import { createJWT } from "../utils/jwt.ts";
import * as bcrypt from "bcrypt";

export class AuthService {
  static async register(
    email: string,
    username: string,
    password: string,
  ): Promise<string> {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) throw new HttpError(401, "Email already exists");

    const existingUsername = await User.findOne({
      username,
    });
    if (existingUsername) throw new HttpError(401, "Username already exists");

    const hashedPassword = await bcrypt.hash(password);
    const newUser = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    return createJWT(newUser._id.toString(), newUser.email, newUser.username);
  }

  static async login(email: string, password: string): Promise<string> {
    const user = await User.findOne({ email });
    if (!user) throw new HttpError(401, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new HttpError(401, "Invalid credentials");

    return createJWT(user._id.toString(), user.email, user.username);
  }
}
