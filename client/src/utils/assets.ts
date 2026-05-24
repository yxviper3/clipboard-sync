import { API_URL } from "./config";

export function resolveAssetUrl(url?: string) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_URL}${url.startsWith("/") ? url : `/${url}`}`;
}
