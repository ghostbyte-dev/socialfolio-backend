import { Context } from "@oak/oak/context";

export const getOrigin = (context: Context): string => {
  const protocol = context.request.headers.get("x-forwarded-proto");
  const domain = context.request.url.host;
  let origin;
  if (protocol) {
    origin = `${protocol}://${domain}`;
  } else {
    origin = context.request.url.origin;
  }
  return origin;
};
