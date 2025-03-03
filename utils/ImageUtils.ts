import { decodeBase64 } from "jsr:@std/encoding/base64";
import { HttpError } from "./HttpError.ts";

export async function saveBase64Image(base64String: string): Promise<string> {
    const matches = base64String.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid base64 image data");

    const extension = matches[1];
    const base64Data = matches[2];

    const buffer = decodeBase64(base64Data);

    const fileName = `${crypto.randomUUID()}.${extension}`;
    const filePath = "/public/images/" + fileName;

    await Deno.writeFile(Deno.cwd() + filePath, buffer);

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