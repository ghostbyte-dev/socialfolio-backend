import User, { IUser, Status } from "../model/User.ts";
import { HttpError } from "../utils/HttpError.ts";
import webp from "webp";
import { ImageMagick, IMagickImage, initialize } from "imageMick";
import { deleteImage, fileToWebpBuffer, resizeImage, saveBase64Image, saveImageFile } from "../utils/ImageUtils.ts";

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
  ): Promise<IUser> {
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
      throw new HttpError(400, "This Profile is disabled")
    }

    return profile;
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
      throw new HttpError(400, "Invalid status type")
    }

    const profile = await User.findById(id);
    if (!profile) {
      throw new HttpError(404, "Profile not found")
    }

    if (profile.status == Status.Unverified) {
      throw new HttpError(401, "Your Profile has to be verified to change your status")
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
    const uuid = crypto.randomUUID();
    const path = "avatars/";
    const fileName = path + uuid;

    const user = await User.findById(id);
    if (!user) {
      throw new HttpError(404, "Profile not found");
    }
    const oldAvatarUrl = user.avatarUrl;
    try {
      const savedPath = await saveImageFile(avatar, "avatars");
      const url = originUrl + savedPath;
      user.avatarUrl = url;
      await user.save();
    } catch (_error) {
      console.log(_error);
      throw new HttpError(500, "Unable to save new avatar");
    }
    if (oldAvatarUrl && oldAvatarUrl != "") {
      try {
        await deleteImage(oldAvatarUrl);
      } catch (_error) {
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
      await deleteImage(user.avatarUrl);
    }

    user.avatarUrl = undefined;

    await user.save();
    return user;
  }

  /*private static async uploadImage(
    file: File,
    path: string,
  ): Promise<string> {
    const fileEnding = file.name.substring(file.name.lastIndexOf("."));

    const stream = file.stream();
    const buffer = (await stream.getReader().read()).value;
    if (!buffer) throw new HttpError(500, "An unexpected error occured");
    
    const resizedBuffer = await resizeImage(buffer);
    const webp = await fileToWebpBuffer(resizedBuffer, fileEnding);

    const uuid = crypto.randomUUID();
    const pathWithFile = "/public/" + path + uuid + ".webp";
    Deno.writeFile(Deno.cwd() + pathWithFile, webp);
    return pathWithFile;
  }*/
}
