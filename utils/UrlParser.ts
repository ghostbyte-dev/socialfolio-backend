export const urlParser = (url: string): string => {
  url = url.trim();

  if (!/^https?:\/\//.test(url)) {
    url = `https://${url}`;
  }

  url = url.replace(/\/$/, "");

  return url;
};
