import { useEffect, useState } from "react";

/** Height of the *visual* viewport in px — the truth about how much screen the
 *  app really has, independent of how the OS reports CSS viewport units.
 *  (iOS standalone has been observed reserving phantom space below the layout
 *  viewport; sizing the shell from visualViewport sidesteps it.) */
export function useVisualViewportHeight(): number | null {
  const [h, setH] = useState<number | null>(() =>
    typeof window !== "undefined" && window.visualViewport ? Math.round(window.visualViewport.height) : null,
  );

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setH(Math.round(vv.height));
    update();
    vv.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      vv.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return h;
}

/** If the OS ends the app's canvas above the physical bottom of the screen
 *  (iOS standalone reserves ~62pt: screen − sat − innerHeight > 0), the canvas
 *  edge already clears the home indicator — an additional safe-area spacer on
 *  the tab bar just doubles the gap. Zero it out in that case. */
export function applyViewportFixups(): void {
  const apply = () => {
    const probe = document.createElement("div");
    probe.style.cssText = "position:fixed;visibility:hidden;top:env(safe-area-inset-top,0px)";
    document.body.appendChild(probe);
    const sat = parseFloat(getComputedStyle(probe).top) || 0;
    probe.remove();

    const deadBottom = window.screen.height - sat - window.innerHeight;
    document.documentElement.style.setProperty(
      "--tabbar-inset",
      deadBottom > 8 ? "0px" : "min(env(safe-area-inset-bottom, 0px), 28px)",
    );
  };
  apply();
  window.visualViewport?.addEventListener("resize", apply);
  window.addEventListener("orientationchange", apply);
}

/** One-line viewport diagnostics for the Home footer — lets a screenshot tell
 *  us exactly what the device thinks is happening. */
export function viewportDebugLine(): string {
  if (typeof window === "undefined") return "";
  const vv = window.visualViewport;
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true);

  // Read the resolved safe-area insets via a probe element
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
    `doc${Math.round(document.documentElement.clientHeight)}`,
    `scr${window.screen.height}`,
    `sat${sat}`,
    `sab${sab}`,
    standalone ? "standalone" : "browser",
  ].join(" · ");
}
