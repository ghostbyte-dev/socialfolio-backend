import User, { Status } from "../model/User.ts";
import { HttpError } from "../utils/HttpError.ts";
import { JwtUtils } from "../utils/jwt.ts";
import * as bcrypt from "bcrypt";
import { EmailUtils } from "../utils/sendEmail.ts";

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const USERNMAME_BLACKLIST = [
  "explore",
  "auth",
  "dashboard",
  "verify",
  "password",
  "credits",
  "imprint",
  "privacy",
  "privacy-policy",
];
export class AuthService {
  static async register(
    email: string,
    username: string,
    password: string,
  ): Promise<string> {
    username = username.trim();
    if (username.includes(" ")) {
      throw new HttpError(401, "Username can not include Whitespaces");
    }

    if (username.length > USERNAME_MAX_LENGTH) {
      throw new HttpError(
        401,
        `Username can not be longer than ${USERNAME_MAX_LENGTH} characters`,
      );
    }

    if (username.length < USERNAME_MIN_LENGTH) {
      throw new HttpError(
        401,
        `Username has to have a minimum length of ${USERNAME_MIN_LENGTH} characters`,
      );
    }

    if (!USERNAME_REGEX.test(username)) {
      throw new HttpError(401, "invalid Username");
    }

    if (USERNMAME_BLACKLIST.includes(username)) {
      throw new HttpError(401, "This Username is not allowed");
    }

    const controlUser = username.toLowerCase();
    const existingUsername = await User.findOne({ controlUser });
    if (existingUsername) throw new HttpError(401, "Username already exists");

    email = email.toLowerCase().trim();
    const existingEmail = await User.findOne({ email });
    if (existingEmail) throw new HttpError(401, "Email already exists");

    const hashedPassword = await bcrypt.hash(password);
    const verificationCode = crypto.randomUUID();
    const newUser = await User.create({
      email,
      username,
      password: hashedPassword,
      status: Status.Unverified,
      verificationCode: verificationCode,
      createdAt: new Date(Date.now()),
    });

    EmailUtils.sendVerificationEmail(email, verificationCode);

    return JwtUtils.createJWT(
      newUser._id.toString(),
      newUser.email,
      newUser.username,
    );
  }

  static async login(email: string, password: string): Promise<string> {
    const user = await User.findOne({ email });
    if (!user) throw new HttpError(401, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new HttpError(401, "Invalid credentials");

    return JwtUtils.createJWT(user._id.toString(), user.email, user.username);
  }

  static async verify(code: string) {
    const user = await User.findOneAndUpdate(
      {
        verificationCode: code,
      },
      {
        status: Status.Visible,
        verificationCode: null,
      },
      { new: true },
    );
    if (!user) {
      throw new HttpError(404, "Invalid Verification Code");
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
    const expirationTimeMinutes = 30;
    user.passwordResetExpiresTimestamp = new Date(
      Date.now() + expirationTimeMinutes * 60 * 1000,
    );

    try {
      await EmailUtils.sendPasswordResetEmail(
        email,
        resetToken,
        expirationTimeMinutes.toString() + " min",
      );
    } catch (_error) {
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

  static async resendVerificationCode(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    console.log(user.id);

    if (user.status != Status.Unverified) {
      throw new HttpError(400, "Already verified");
    }

    const verificationCode = crypto.randomUUID();
    user.verificationCode = verificationCode;
    try {
      await EmailUtils.sendVerificationEmail(user.email, verificationCode);
    } catch (_error) {
      throw new HttpError(500, "An error occured sending the email.");
    }

    await user.save();

    return;
  }
}
