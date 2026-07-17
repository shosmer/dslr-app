import { useEffect, useState } from "react";

/** Screen wake lock for the eclipse sequence (iOS 16.4+). Returns whether the
 *  lock is active; callers show a "keep the screen awake yourself" fallback
 *  warning when unsupported (PRD §13 constraint table). */
export function useWakeLock(enabled: boolean): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!enabled || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          void lock.release();
          return;
        }
        setActive(true);
        lock.addEventListener("release", () => setActive(false));
      } catch {
        setActive(false);
      }
    };

    void acquire();
    // Re-acquire when returning to the foreground (locks auto-release on hide)
    const onVisible = () => {
      if (document.visibilityState === "visible") void acquire();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release();
      setActive(false);
    };
  }, [enabled]);

  return active;
}

export const wakeLockSupported = typeof navigator !== "undefined" && "wakeLock" in navigator;
