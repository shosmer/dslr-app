import type { CSSProperties, ReactNode } from "react";

/**
 * SafetyBanner — full-bleed eye-safety cue for Eclipse Mode. Blunt and
 * unmissable: danger = FILTER ON NOW, safe = totality, look up.
 * Ported from the design-system source (in sync with ui_kits/ljosmynd/index.html).
 */
export interface SafetyBannerProps {
  state?: "danger" | "safe" | "warn";
  title: string;
  detail?: string | null;
  icon?: ReactNode;
}

const TONES: Record<string, { bg: string; fg: string; sub: string }> = {
  danger: { bg: "var(--danger)", fg: "var(--paper)", sub: "oklch(0.96 0.006 80 / 0.8)" },
  safe: { bg: "var(--safe)", fg: "var(--text-on-accent)", sub: "oklch(0.18 0.02 60 / 0.7)" },
  warn: { bg: "var(--warn)", fg: "var(--text-on-accent)", sub: "oklch(0.18 0.02 60 / 0.7)" },
};

export function SafetyBanner({ state = "warn", title, detail = null, icon = null }: SafetyBannerProps) {
  const t = TONES[state];
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-4)",
        padding: "var(--space-4) var(--space-5)",
        background: t.bg,
        borderRadius: "var(--radius-md)",
      }}
    >
      {icon && <span style={{ display: "flex", flex: "0 0 auto", color: t.fg }}>{icon}</span>}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-h3)",
            fontWeight: "var(--weight-bold)" as CSSProperties["fontWeight"],
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            color: t.fg,
            lineHeight: 1.1,
          }}
        >
          {title}
        </span>
        {detail && (
          <span style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-sm)", color: t.sub }}>{detail}</span>
        )}
      </div>
    </div>
  );
}
