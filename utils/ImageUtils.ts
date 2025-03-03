import { decodeBase64 } from "jsr:@std/encoding/base64";
import { HttpError } from "./HttpError.ts";
import { ImageMagick, IMagickImage, initialize } from "imageMick";
import webp from "webp";

export async function saveBase64Image(base64String: string): Promise<string> {
    const matches = base64String.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid base64 image data");

    const extension = matches[1];
    const base64Data = matches[2];

    const buffer = decodeBase64(base64Data);

    const resizedBuffer = await resizeImage(buffer);
    const webp = await fileToWebpBuffer(resizedBuffer, extension);

    const fileName = `${crypto.randomUUID()}.webp`;
    const filePath = "/public/images/" + fileName;

    await Deno.writeFile(Deno.cwd() + filePath, webp);

    return filePath;
}


export async function deleteImage(url: string) {
    const filePath = url.substring(url.lastIndexOf("public/"));
    try {
        console.log(filePath);
        await Deno.remove(filePath);
    } catch (_error) {
        throw new HttpError(500, "Unable to delete image " + url);
    }
}
export async function fileToWebpBuffer(
    file: Uint8Array,
    fileEnding: string,
  ): Promise<Uint8Array> {
    return await webp.buffer2webpbuffer(
      file,
      fileEnding,
      "-q 100",
      "./image.webp",
    ) as Uint8Array;
  }

export async function resizeImage(buffer: Uint8Array): Promise<Uint8Array> {
    await initialize();
    return new Promise((resolve) =>
      ImageMagick.read(buffer, (image: IMagickImage) => {
        image.resize(400, 400);
        image.write(
          (data) => resolve(data),
        );
      })
    );
  }