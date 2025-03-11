import { decodeBase64 } from "jsr:@std/encoding/base64";
import { HttpError } from "./HttpError.ts";
import sharp from "sharp";

export class ImageService {
  static async saveBase64Image(
    base64String: string,
    folder: string,
  ): Promise<string> {
    const matches = base64String.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid base64 image data");

    const base64Data = matches[2];

    const buffer = decodeBase64(base64Data);

    const processedImage = await this.processImage(buffer);

    const fileName = `${crypto.randomUUID()}.webp`;
    const filePath = "/public/" + folder + "/" + fileName;

    await Deno.writeFile(Deno.cwd() + filePath, processedImage);

    return filePath;
  }

  static async saveImageFile(
    file: File,
    folder: string,
  ): Promise<string> {
    const fileEnding = file.type.split("/").pop();
    if (!fileEnding) {
      throw new HttpError(500, "An error occured when saving image");
    }

    const stream = file.stream();
    const buffer = (await stream.getReader().read()).value;
    if (!buffer) throw new HttpError(500, "An unexpected error occured");

    const processedImage = await this.processImage(buffer);

    const uuid = crypto.randomUUID();
    const pathWithFile = "/public/" + folder + "/" + uuid + ".webp";

    Deno.writeFile(Deno.cwd() + pathWithFile, processedImage);
    return pathWithFile;
  }

  static async deleteImage(url: string) {
    const filePath = url.substring(url.lastIndexOf("public/"));
    try {
      await Deno.remove(filePath);
    } catch (_error) {
      throw new HttpError(500, "Unable to delete image " + url);
    }
  }

  private static async processImage(buffer: Uint8Array): Promise<Uint8Array> {
    return await sharp(buffer)
      .resize(400, 400)
      .webp({ quality: 90 })
      .toBuffer();
  }
}
