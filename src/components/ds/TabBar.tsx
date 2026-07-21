import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * TabBar — bottom navigation, 5 tabs, translucent blurred bar.
 * Ported from the design-system source (in sync with ui_kits/ljosmynd/index.html).
 * Production addition: safe-area inset padding for the iOS home indicator.
 */
export interface TabItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: string | number;
}

export interface TabBarProps {
  items: TabItem[];
  activeId: string;
  onChange?: (id: string) => void;
}

export function TabBar({ items, activeId, onChange }: TabBarProps) {
  const navRef = useRef<HTMLElement>(null);

  // Stop a swipe-down on the bar from rubber-banding the page. iOS treats a
  // touch-drag on a fixed, non-scrolling element as a document-level pan;
  // a non-passive touchmove preventDefault blocks that bounce. Taps don't
  // fire touchmove, so the tab buttons still work normally.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const block = (e: TouchEvent) => e.preventDefault();
    nav.addEventListener("touchmove", block, { passive: false });
    return () => nav.removeEventListener("touchmove", block);
  }, []);

  return (
    <nav
      ref={navRef}
      style={{
        // With status-bar-style=default, iOS insets the webview ABOVE the home
        // indicator, so the reserved strip is already outside our canvas — no
        // bottom padding needed. The bar sits flush at the webview bottom, as
        // low as it can go. (Padding here would just be dead space above the
        // labels — the "white space" that pushed the bar up.)
        display: "flex",
        height: "var(--tabbar-h)",
        boxSizing: "content-box",
        paddingBottom: 0,
        background: "oklch(0.16 0.007 60 / 0.85)",
        backdropFilter: "var(--blur-scrim)",
        WebkitBackdropFilter: "var(--blur-scrim)",
        borderTop: "1px solid var(--border)",
        touchAction: "none",
      }}
    >
      {items.map((it) => {
        const active = it.id === activeId;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange?.(it.id)}
            aria-current={active ? "page" : undefined}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              position: "relative",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: active ? "var(--accent)" : "var(--text-tertiary)",
              transition: "color var(--dur-base) var(--ease-out)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{ display: "flex", width: 24, height: 24 }}>{it.icon}</span>
            <span
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "11px",
                fontWeight: (active
                  ? "var(--weight-semibold)"
                  : "var(--weight-medium)") as CSSProperties["fontWeight"],
                letterSpacing: "0.01em",
              }}
            >
              {it.label}
            </span>
            {it.badge != null && (
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  right: "calc(50% - 22px)",
                  minWidth: 16,
                  height: 16,
                  padding: "0 4px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--accent)",
                  color: "var(--text-on-accent)",
                  fontSize: "10px",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {it.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
