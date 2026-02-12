import { RouterContext } from "@oak/oak/router";
import User, { IUser, Status } from "../model/User.ts";
import Widget from "../model/Widget.ts";
import { HttpError } from "../utils/HttpError.ts";
import { ImageService } from "../utils/ImageUtils.ts";
import { GET_BY_USERNAME_ROUTE } from "../routes/user.routes.ts";
import { UserDto } from "../types/user.types.ts";
import { isBot } from "../utils/isBot.ts";
import { ViewService } from "./view.service.ts";
import { getClientIp } from "../utils/getClientIp.ts";

export class UserService {
  static async getById(id: string): Promise<IUser> {
    const profile = await User.findOne({ _id: id });
    if (!profile) {
      throw new HttpError(404, "Profile not found");
    }
    return profile;
  }

  static async getByUsername(
    username: string,
    jwtUserId: string | undefined,
    context: RouterContext<typeof GET_BY_USERNAME_ROUTE> | undefined,
  ): Promise<UserDto> {
    const profile = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });
    if (!profile) {
      throw new HttpError(404, "Profile not found");
    }
    if (
      profile.status == Status.Unverified &&
      ((jwtUserId && jwtUserId != profile.id) || !jwtUserId)
    ) {
      throw new HttpError(400, "This Profile is not verified yet");
    }

    if (profile.status == Status.Disabled && profile.id != jwtUserId) {
      throw new HttpError(400, "This Profile is disabled");
    }

    const profileViews = await ViewService.getViewsOfProfile(profile._id);

    if (context) {
      if (!jwtUserId || jwtUserId != profile._id.toString()) {
        const bot = isBot(context);
        if (!bot) {
          const isView: string | null = context.request.url.searchParams.get(
            "view",
          );
          if (isView) {
            const userAgent = context.request.headers.get("user-agent");
            ViewService.recordView(profile._id, getClientIp(context), userAgent);
          }
        }
      }
    }

    return UserDto.fromUser(profile, profileViews);
  }

  static async updateUsername(id: string, username: string): Promise<IUser> {
    const profileWithUsername = await User.find({
      username: username,
    });

    if (profileWithUsername.length > 0) {
      throw new HttpError(400, "Username already exists");
    }

    const profile = await User.findOneAndUpdate({ _id: id }, {
      username: username,
    }, { new: true });
    if (!profile) {
      throw new HttpError(404, "Profile not found");
    }
    return profile;
  }

  static async updateDescription(
    id: string,
    description: string,
  ): Promise<IUser> {
    const profile = await User.findOneAndUpdate({ _id: id }, {
      description: description,
    }, { new: true });
    if (!profile) {
      throw new HttpError(404, "Profile not found");
    }
    return profile;
  }

  static async updateDisplayName(
    id: string,
    displayName: string,
  ): Promise<IUser> {
    const profile = await User.findOneAndUpdate({ _id: id }, {
      displayName: displayName,
    }, { new: true });
    if (!profile) {
      throw new HttpError(404, "Profile not found");
    }
    return profile;
  }

  static async updateStatus(
    id: string,
    status: Status,
  ): Promise<IUser> {
    if (!Object.values(Status).includes(status)) {
      throw new HttpError(400, "Invalid status type");
    }

    const profile = await User.findById(id);
    if (!profile) {
      throw new HttpError(404, "Profile not found");
    }

    if (profile.status == Status.Unverified) {
      throw new HttpError(
        401,
        "Your Profile has to be verified to change your status",
      );
    }

    profile.status = status;
    profile.save();

    return profile;
  }

  static async uploadAvatar(
    avatar: File,
    id: string,
    originUrl: string,
  ): Promise<IUser> {
    const user = await User.findById(id);
    if (!user) {
      throw new HttpError(404, "Profile not found");
    }
    const oldAvatarUrl = user.avatarUrl;
    try {
      const savedPath = await ImageService.saveImageFile(avatar, "avatars");
      console.log(savedPath);
      const url = originUrl + savedPath;
      user.avatarUrl = url;
      await user.save();
      // deno-lint-ignore no-explicit-any
    } catch (error: any) {
      console.log(error);
      if (error.message) {
        console.error(error.message);
      }
      throw new HttpError(500, "Unable to save new avatar");
    }
    if (oldAvatarUrl && oldAvatarUrl != "") {
      try {
        await ImageService.deleteImage(oldAvatarUrl);
        // deno-lint-ignore no-explicit-any
      } catch (error: any) {
        if (error.message) {
          console.error(error.message);
        }
        console.log("unable to delete image " + oldAvatarUrl);
      }
    }

    return user;
  }

  static async deleteAvatar(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new HttpError(404, "Profile not found");
    }

    if (user.avatarUrl && user.avatarUrl != "") {
      try {
        await ImageService.deleteImage(user.avatarUrl);
      } catch (e) {
        console.error(e);
      }
    }

    user.avatarUrl = undefined;

    await user.save();
    return user;
  }

  static async deleteAccount(userId: string) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) throw new HttpError(404, "Profile not found");
    await Widget.deleteMany({ user: user._id });
    return user;
  }
}
