export function paginationUrl(currentUrl, page, query, category) {
  const url = new URL(currentUrl);
  url.pathname = /^\/page\/\d+\/?$/.test(url.pathname)
    ? "/blog/"
    : url.pathname.replace(/\/page\/\d+\/?$/, "/");
  for (const [key, value] of [
    ["q", query],
    ["category", category],
    ["page", page > 1 ? String(page) : ""],
  ]) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  return url;
}
