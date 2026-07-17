import type { CSSProperties, MouseEvent, ReactNode } from "react";

/**
 * IconButton — square, ≥44px tappable icon control. Used in headers,
 * hotspot dismiss, capture retake, etc. Ghost by default; "accent" for
 * the round shutter-style capture button.
 * Ported from design/components/actions/IconButton.jsx.
 */
export interface IconButtonProps {
  /** The glyph (Lucide node) */
  icon: ReactNode;
  /** Accessible label — required (icon-only control) */
  label: string;
  variant?: "ghost" | "solid" | "accent";
  /** px — never below 44 */
  size?: number;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

const VARIANTS: Record<string, CSSProperties> = {
  ghost: { background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" },
  solid: { background: "var(--surface-raised)", color: "var(--text-primary)", border: "1px solid var(--border-strong)" },
  accent: { background: "var(--accent)", color: "var(--text-on-accent)", border: "1px solid transparent", boxShadow: "var(--glow-amber)" },
};

export function IconButton({ icon, label, variant = "ghost", size = 44, onClick }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="press-icon"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "var(--radius-pill)",
        cursor: "pointer",
        transition: "transform var(--dur-fast) var(--ease-out)",
        WebkitTapHighlightColor: "transparent",
        ...VARIANTS[variant],
      }}
    >
      {icon}
    </button>
  );
}
