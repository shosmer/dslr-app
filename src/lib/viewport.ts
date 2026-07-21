/** One-line viewport diagnostics for the Home footer — lets a screenshot tell
 *  us exactly what the device reports (safe-area insets, viewport units,
 *  display mode). Temporary; strip before the trip. */
export function viewportDebugLine(): string {
  if (typeof window === "undefined") return "";
  const vv = window.visualViewport;
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true);

  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;visibility:hidden;top:env(safe-area-inset-top,0px);bottom:env(safe-area-inset-bottom,0px)";
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  const sat = Math.round(parseFloat(cs.top) || 0);
  const sab = Math.round(parseFloat(cs.bottom) || 0);
  probe.remove();

  return [
    `vv${vv ? Math.round(vv.height) : "?"}`,
    `win${window.innerHeight}`,
    `scr${window.screen.height}`,
    `sat${sat}`,
    `sab${sab}`,
    standalone ? "standalone" : "browser",
  ].join(" · ");
}
