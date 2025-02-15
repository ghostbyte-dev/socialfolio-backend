import User, { IUser } from "../model/User.ts";
import { HttpError } from "../utils/HttpError.ts";
import webp from "webp";

export class UserService {
  static async getById(id: string): Promise<IUser> {
    const profile = await User.findOne({ _id: id });
    if (!profile) {
      throw new HttpError(404, "Profile not found");
    }
    return profile;
  }

  static async getByUsername(username: string): Promise<IUser> {
    const profile = await User.findOne({
      username: username,
    });
    if (!profile) {
      throw new HttpError(404, "Profile not found");
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
      const savedPath = await this.uploadImage(avatar, fileName);
      const url = originUrl + savedPath;
      user.avatarUrl = url;
      await user.save();
    } catch (_error) {
      throw new HttpError(500, "Unable to save new avatar");
    }
    if (oldAvatarUrl && oldAvatarUrl != "") {
      await this.deleteImage(oldAvatarUrl);
    }

    return user;
  }

  private static async deleteImage(url: string) {
    const filePath = url.substring(url.lastIndexOf("public/"));
    try {
      console.log(filePath);
      await Deno.remove(filePath);
    } catch (_error) {
      console.log("unable to delete image " + filePath);
    }
  }

  private static async uploadImage(
    file: File,
    path: string,
  ): Promise<string> {
    const fileEnding = file.name.substring(file.name.lastIndexOf("."));
    const webpBuffer = await this.fileToWebpBuffer(file, fileEnding);
    const uuid = crypto.randomUUID();
    const pathWithFile = "/public/" + path + uuid + ".webp";
    Deno.writeFile(Deno.cwd() + pathWithFile, webpBuffer);
    return pathWithFile;
  }

  private static async fileToWebpBuffer(
    file: File,
    fileEnding: string,
  ): Promise<Uint8Array> {
    const stream = file.stream();
    const buffer = (await stream.getReader().read()).value;
    if (!buffer) throw new HttpError(500, "An unexpected error occured");
    return await webp.buffer2webpbuffer(
      buffer,
      fileEnding,
      "-q 80",
      "./image.webp",
    ) as Uint8Array;
  }
}
