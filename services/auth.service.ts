import User from "../model/User.ts";
import { HttpError } from "../utils/HttpError.ts";
import { createJWT } from "../utils/jwt.ts";
import * as bcrypt from "bcrypt";
import { sendVerificationEmail } from "../utils/sendEmail.ts";

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
    const verificationCode = crypto.randomUUID();
    const newUser = await User.create({
      email,
      username,
      password: hashedPassword,
      verified: false,
      verificationCode: verificationCode,
    });

    sendVerificationEmail(email, verificationCode);

    return createJWT(newUser._id.toString(), newUser.email, newUser.username);
  }

  static async login(email: string, password: string): Promise<string> {
    const user = await User.findOne({ email });
    if (!user) throw new HttpError(401, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new HttpError(401, "Invalid credentials");

    return createJWT(user._id.toString(), user.email, user.username);
  }

  static async verify(code: string) {
    const user = await User.findOneAndUpdate(
      {
        verificationCode: code,
      },
      {
        verified: true,
        verificationCode: null,
      },
      { new: true },
    );
    if (!user) {
      throw new HttpError(404, "could not find User with Verification Code");
    }
  }
}
