import type { CSSProperties, ReactNode } from "react";

/**
 * Badge — compact status/label pill. Semantic tones map to field states.
 * "amber" for the eclipse-day promotion badge, "danger"/"safe" for safety
 * states, "neutral" for tags & metadata.
 * Ported from design/components/display/Badge.jsx.
 */
export interface BadgeProps {
  children: ReactNode;
  tone?: "neutral" | "amber" | "teal" | "safe" | "warn" | "danger";
  icon?: ReactNode;
  size?: "sm" | "md";
}

const TONES: Record<string, { bg: string; fg: string; bd: string }> = {
  neutral: { bg: "var(--surface-raised)", fg: "var(--text-secondary)", bd: "var(--border)" },
  amber: { bg: "var(--accent-wash)", fg: "var(--amber-400)", bd: "transparent" },
  teal: { bg: "var(--accent-2-wash)", fg: "var(--teal-400)", bd: "transparent" },
  safe: { bg: "var(--safe-tint)", fg: "var(--safe)", bd: "transparent" },
  warn: { bg: "var(--warn-tint)", fg: "var(--warn)", bd: "transparent" },
  danger: { bg: "var(--danger-tint)", fg: "var(--danger)", bd: "transparent" },
};

export function Badge({ children, tone = "neutral", icon = null, size = "md" }: BadgeProps) {
  const t = TONES[tone];
  const dims = size === "sm" ? { pad: "3px 8px", font: "11px" } : { pad: "5px 12px", font: "var(--text-xs)" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: dims.pad,
        fontFamily: "var(--font-mono)",
        fontSize: dims.font,
        fontWeight: "var(--weight-medium)" as CSSProperties["fontWeight"],
        letterSpacing: "var(--tracking-caps)",
        textTransform: "uppercase",
        borderRadius: "var(--radius-pill)",
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {children}
    </span>
  );
}
