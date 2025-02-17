import User from "../model/User.ts";
import { HttpError } from "../utils/HttpError.ts";
import { createJWT } from "../utils/jwt.ts";
import * as bcrypt from "bcrypt";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../utils/sendEmail.ts";

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

  static async requestPasswordReset(email: string) {
    const user = await User.findOne({ email: email });
    if (!user) throw new HttpError(404, "User with that email does not exist");

    const resetToken = crypto.randomUUID();
    const resetTokenBuffer = new TextEncoder().encode(resetToken);
    const hashedResetTokenBuffer = await crypto.subtle.digest(
      "SHA-256",
      resetTokenBuffer,
    );
    const hashedResetToken = new TextDecoder().decode(hashedResetTokenBuffer);

    user.passwordResetToken = hashedResetToken;
    user.passwordResetExpiresTimestamp = new Date(Date.now() + 30 * 60 * 1000);

    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (_error) {
      console.log("hallo");
      throw new HttpError(500, "failed to send email");
    }

    await user.save();
  }

  static async resetPassword(token: string, newPassword: string) {
    const resetTokenBuffer = new TextEncoder().encode(token);
    const hashedResetTokenBuffer = await crypto.subtle.digest(
      "SHA-256",
      resetTokenBuffer,
    );

    const hashedResetToken = new TextDecoder().decode(hashedResetTokenBuffer);
    const user = await User.findOne({ passwordResetToken: hashedResetToken });
    if (!user) throw new HttpError(400, "User with reset Token not found");

    if (!user.passwordResetExpiresTimestamp) {
      throw new HttpError(400, "Invalid expiration time");
    }

    if (user.passwordResetExpiresTimestamp < new Date(Date.now())) {
      throw new HttpError(400, "Password reset token expired");
    }

    user.passwordResetToken = undefined;
    user.passwordResetExpiresTimestamp = undefined;

    const hashedNewPassword = await bcrypt.hash(newPassword);
    user.password = hashedNewPassword;

    await user.save();
  }
}
