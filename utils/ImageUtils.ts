import { decodeBase64 } from "jsr:@std/encoding/base64";
import { HttpError } from "./HttpError.ts";
import sharp from "sharp";

export async function saveBase64Image(base64String: string, folder: string): Promise<string> {
    const matches = base64String.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid base64 image data");

    const base64Data = matches[2];

    const buffer = decodeBase64(base64Data);

    const resizedBuffer = await resizeImage(buffer);
    const webp = await fileToWebpBuffer(resizedBuffer);

    const fileName = `${crypto.randomUUID()}.webp`;
    const filePath = "/public/" + folder + "/" + fileName;

    await Deno.writeFile(Deno.cwd() + filePath, webp);

    return filePath;
}

export async function saveImageFile(
  file: File,
  folder: string,
): Promise<string> {
  const fileEnding = file.type.split('/').pop();
  if (!fileEnding) {
    throw new HttpError(500, "An error occured when saving image");
  }

  const stream = file.stream();
  const buffer = (await stream.getReader().read()).value;
  if (!buffer) throw new HttpError(500, "An unexpected error occured");
  
  const resizedBuffer = await resizeImage(buffer);
  const webp = await fileToWebpBuffer(resizedBuffer);

  const uuid = crypto.randomUUID();
  const pathWithFile = "/public/" + folder + "/" + uuid + ".webp";
  console.log(pathWithFile)
  Deno.writeFile(Deno.cwd() + pathWithFile, webp);
  return pathWithFile;
}


export async function deleteImage(url: string) {
    const filePath = url.substring(url.lastIndexOf("public/"));
    try {
        await Deno.remove(filePath);
    } catch (_error) {
        throw new HttpError(500, "Unable to delete image " + url);
    }
}
export async function fileToWebpBuffer(
    file: Uint8Array,
  ): Promise<Uint8Array> {
    return await sharp(file)
    .webp({ quality: 100 })
    .toBuffer();
  }

export async function resizeImage(buffer: Uint8Array): Promise<Uint8Array> {
  return await sharp(buffer)
  .resize(400, 400) // Skaliere das Bild auf 400x400 px
  .toBuffer();
  }