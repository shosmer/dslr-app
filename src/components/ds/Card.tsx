import type { CSSProperties, MouseEvent, ReactNode } from "react";

/**
 * Card — the base surface container. Used for guide cards, recommendation
 * combos, dashboard tiles. Emphasis comes from `glow` or `tone` — never a
 * colored left border (DS anti-trope).
 * Ported from design/components/display/Card.jsx.
 */
export interface CardProps {
  children: ReactNode;
  tone?: "default" | "sunken" | "amber" | "teal";
  /** corona glow instead of drop shadow — for the featured/active card */
  glow?: boolean;
  interactive?: boolean;
  padding?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

const TONES: Record<string, CSSProperties> = {
  default: { background: "var(--surface-card)", border: "1px solid var(--border)" },
  sunken: { background: "var(--surface-sunken)", border: "1px solid var(--border)" },
  amber: { background: "var(--accent-wash)", border: "1px solid oklch(0.80 0.145 75 / 0.35)" },
  teal: { background: "var(--accent-2-wash)", border: "1px solid oklch(0.80 0.095 192 / 0.35)" },
};

export function Card({
  children,
  tone = "default",
  glow = false,
  interactive = false,
  padding = "var(--space-5)",
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive && onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(e as unknown as MouseEvent<HTMLDivElement>);
              }
            }
          : undefined
      }
      className={interactive ? "card-interactive" : undefined}
      style={{
        borderRadius: "var(--radius-lg)",
        padding,
        boxShadow: glow ? "var(--glow-amber)" : "var(--shadow-md)",
        cursor: interactive ? "pointer" : "default",
        transition: "transform var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)",
        ...TONES[tone],
      }}
    >
      {children}
    </div>
  );
}
