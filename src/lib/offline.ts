import { useEffect, useState } from "react";

export interface OfflineReadiness {
  /** a service worker controls this page AND the precache has real content */
  ready: boolean;
  files: number;
  mb: number | null;
  persisted: boolean;
  /** false until the first async check resolves */
  checked: boolean;
}

async function readReadiness(): Promise<Omit<OfflineReadiness, "checked">> {
  const controlled = "serviceWorker" in navigator && !!navigator.serviceWorker.controller;

  let files = 0;
  if ("caches" in window) {
    try {
      const keys = await caches.keys();
      for (const key of keys) {
        const cache = await caches.open(key);
        files += (await cache.keys()).length;
      }
    } catch {
      /* ignore */
    }
  }

  const est = await navigator.storage?.estimate?.().catch(() => undefined);
  const mb = est?.usage != null ? est.usage / (1024 * 1024) : null;
  const persisted = (await navigator.storage?.persisted?.().catch(() => false)) ?? false;

  return { ready: controlled && files > 0, files, mb, persisted };
}

/** Passive offline-readiness signal for Home. The app precaches itself on
 *  install (vite-plugin-pwa) — this does NOT download anything, it just reports
 *  whether that finished. Re-checks when the service worker takes control or
 *  connectivity flips. */
export function useOfflineReadiness(): OfflineReadiness {
  const [state, setState] = useState<OfflineReadiness>({
    ready: false,
    files: 0,
    mb: null,
    persisted: false,
    checked: false,
  });

  useEffect(() => {
    let alive = true;
    const check = () => {
      void readReadiness().then((r) => {
        if (alive) setState({ ...r, checked: true });
      });
    };
    check();
    const sw = navigator.serviceWorker;
    sw?.addEventListener("controllerchange", check);
    window.addEventListener("online", check);
    window.addEventListener("offline", check);
    return () => {
      alive = false;
      sw?.removeEventListener("controllerchange", check);
      window.removeEventListener("online", check);
      window.removeEventListener("offline", check);
    };
  }, []);

  return state;
}
