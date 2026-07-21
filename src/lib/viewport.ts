/** One-line viewport diagnostics for the Home footer — lets a screenshot tell
 *  us exactly what the device reports. Temporary; strip before the trip. */
export function viewportDebugLine(): string {
  if (typeof window === "undefined") return "";
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true);

  // Bulletproof inset probe: a fixed 1px-wide div whose HEIGHT is the inset,
  // measured via getBoundingClientRect (more reliable than reading top/bottom
  // computed offsets on an auto-sized element).
  const measure = (prop: string): number => {
    const el = document.createElement("div");
    el.style.cssText = `position:fixed;top:0;left:0;width:1px;visibility:hidden;height:env(${prop},0px)`;
    document.body.appendChild(el);
    const h = Math.round(el.getBoundingClientRect().height);
    el.remove();
    return h;
  };
  const sat = measure("safe-area-inset-top");
  const sab = measure("safe-area-inset-bottom");

  return [
    `win${window.innerHeight}`,
    `scr${window.screen.height}`,
    `avail${(window.screen as Screen & { availHeight?: number }).availHeight ?? "?"}`,
    `sy${window.screenY}`,
    `oh${window.outerHeight}`,
    `sat${sat}`,
    `sab${sab}`,
    standalone ? "standalone" : "browser",
  ].join(" · ");
}
