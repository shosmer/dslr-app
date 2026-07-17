import React from "react";

/**
 * Badge — compact status/label pill. Semantic tones map to field states.
 * Use "amber" for the eclipse-day promotion badge, "danger"/"safe" for
 * safety states, "neutral" for tags & metadata.
 */
export function Badge({ children, tone = "neutral", icon = null, size = "md" }) {
  const tones = {
    neutral: { bg: "var(--surface-raised)", fg: "var(--text-secondary)", bd: "var(--border)" },
    amber:   { bg: "var(--accent-wash)", fg: "var(--amber-400)", bd: "transparent" },
    teal:    { bg: "var(--accent-2-wash)", fg: "var(--teal-400)", bd: "transparent" },
    safe:    { bg: "var(--safe-tint)", fg: "var(--safe)", bd: "transparent" },
    warn:    { bg: "var(--warn-tint)", fg: "var(--warn)", bd: "transparent" },
    danger:  { bg: "var(--danger-tint)", fg: "var(--danger)", bd: "transparent" },
  }[tone];
  const dims = size === "sm"
    ? { pad: "3px 8px", font: "11px" }
    : { pad: "5px 12px", font: "var(--text-xs)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: dims.pad, fontFamily: "var(--font-mono)", fontSize: dims.font,
      fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase", borderRadius: "var(--radius-pill)",
      background: tones.bg, color: tones.fg, border: `1px solid ${tones.bd}`,
      whiteSpace: "nowrap",
    }}>
      {icon}{children}
    </span>
  );
}
