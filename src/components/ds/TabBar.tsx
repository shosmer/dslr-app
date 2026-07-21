import type { CSSProperties, ReactNode } from "react";

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
  return (
    <nav
      style={{
        // Native pattern: one bar-height row + the home-indicator inset below
        // it (standalone reports SAB≈34; the bar background flows into that
        // zone and labels sit above it, exactly like a UIKit tab bar).
        display: "flex",
        height: "var(--tabbar-h)",
        boxSizing: "content-box",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        background: "oklch(0.16 0.007 60 / 0.85)",
        backdropFilter: "var(--blur-scrim)",
        WebkitBackdropFilter: "var(--blur-scrim)",
        borderTop: "1px solid var(--border)",
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
