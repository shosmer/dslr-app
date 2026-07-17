import { useEffect, useState } from "react";

/** Live clock — re-renders at `intervalMs`. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "26d 04:11:52" for long spans, "04:11:52" under a day, "01:47" under an hour. */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const s = Math.floor(ms / 1000);
  const days = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (days > 0) return `${days}d ${pad(h)}:${pad(m)}:${pad(sec)}`;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(sec)}`;
  return `${pad(m)}:${pad(sec)}`;
}

/** "2m 07s" style duration. */
export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m}m ${pad(s)}s` : `${s}s`;
}

/** "17:45:46" clock time (GMT — Iceland has no DST). */
export function formatClockGMT(iso: string, withSeconds = true): string {
  const d = new Date(iso);
  const h = pad(d.getUTCHours());
  const m = pad(d.getUTCMinutes());
  return withSeconds ? `${h}:${m}:${pad(d.getUTCSeconds())}` : `${h}:${m}`;
}

/** Local date in YYYY-MM-DD (device timezone; in Iceland that's GMT). */
export function localISODate(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
