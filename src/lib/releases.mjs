const allowedHost = "github.com";

export function releaseAsset(release, extension) {
  return release?.assets?.find((asset) => {
    try {
      const url = new URL(asset.browser_download_url);
      return (
        asset.name.endsWith(extension) &&
        url.protocol === "https:" &&
        url.hostname === allowedHost &&
        url.pathname.startsWith(
          "/blademainer/screen-capture/releases/download/",
        )
      );
    } catch {
      return false;
    }
  });
}

export function selectRelease(releases) {
  if (!Array.isArray(releases)) return null;
  const usable = releases.filter(
    (release) => !release.draft && releaseAsset(release, ".dmg"),
  );
  const byDate = (a, b) =>
    new Date(b.published_at || 0) - new Date(a.published_at || 0);
  return (
    usable.filter((release) => !release.prerelease).sort(byDate)[0] ||
    usable.sort(byDate)[0] ||
    null
  );
}
