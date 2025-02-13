export const urlParser = (url: string): string => {
  console.log(url);
  url = url.trim();

  if (!/^https?:\/\//.test(url)) {
    url = `https://${url}`;
  }

  url = url.replace(/\/$/, "");

  return url;
};
