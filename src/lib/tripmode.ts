/** "Trip mode — download everything" (PRD §13 offline strategy).
 *  The app shell, content, data, and fonts are already precached by the service
 *  worker on install; this action verifies the caches are warm, requests
 *  persistent storage, and reports what's on disk. (The 3D model joins the
 *  list when it lands.) */
export async function downloadEverything(): Promise<string> {
  try {
    if (!("caches" in window)) return "Offline caching unavailable in this browser";

    await navigator.storage?.persist?.();

    // Touch every precached URL so nothing is pending
    const keys = await caches.keys();
    let files = 0;
    for (const key of keys) {
      const cache = await caches.open(key);
      files += (await cache.keys()).length;
    }

    const est = await navigator.storage?.estimate?.();
    const mb = est?.usage != null ? (est.usage / (1024 * 1024)).toFixed(1) : null;
    const persisted = (await navigator.storage?.persisted?.()) ?? false;

    if (files === 0) return "Nothing cached yet — open the app once online";
    return `Offline-ready · ${files} files${mb ? ` · ${mb} MB` : ""}${persisted ? " · persistent" : ""}`;
  } catch {
    return "Could not verify offline cache";
  }
}
