import React from "react";

/**
 * Card — the base surface container. Used for guide cards, recommendation
 * combos, dashboard tiles. Optional accent left-edge is NOT used (avoid the
 * colored-left-border trope); emphasis comes from `glow` or `tone` instead.
 */
export function Card({
  children,
  tone = "default",
  glow = false,
  interactive = false,
  padding = "var(--space-5)",
  onClick,
  ...rest
}) {
  const tones = {
    default: { background: "var(--surface-card)", border: "1px solid var(--border)" },
    sunken:  { background: "var(--surface-sunken)", border: "1px solid var(--border)" },
    amber:   { background: "var(--accent-wash)", border: "1px solid oklch(0.80 0.145 75 / 0.35)" },
    teal:    { background: "var(--accent-2-wash)", border: "1px solid oklch(0.80 0.095 192 / 0.35)" },
  }[tone];
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: "var(--radius-lg)",
        padding,
        boxShadow: glow ? "var(--glow-amber)" : "var(--shadow-md)",
        cursor: interactive ? "pointer" : "default",
        transition: "transform var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)",
        ...tones,
      }}
      onMouseEnter={interactive ? (e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "var(--border-strong)"; } : undefined}
      onMouseLeave={interactive ? (e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = ""; } : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}
