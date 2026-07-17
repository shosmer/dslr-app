import type { CSSProperties, MouseEvent, ReactNode } from "react";

/**
 * Button — the primary field action. Big, high-contrast, thumb-reachable.
 * Corona-amber fill for the one primary action per view; ghost for
 * low-priority; danger for eye-safety / destructive.
 * Ported from design/components/actions/Button.jsx.
 */
export interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** sm 40px · md 48px · lg 56px (field primary) — never below 44px for on-glove use */
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
}

const SIZES: Record<string, { height: number | string; padding: string; font: string; radius: string }> = {
  sm: { height: 40, padding: "0 16px", font: "var(--text-sm)", radius: "var(--radius-sm)" },
  md: { height: 48, padding: "0 22px", font: "var(--text-body)", radius: "var(--radius-md)" },
  lg: { height: "var(--touch-lg)", padding: "0 28px", font: "var(--text-body-lg)", radius: "var(--radius-md)" },
};

const VARIANTS: Record<string, CSSProperties> = {
  primary: {
    background: "var(--accent)",
    color: "var(--text-on-accent)",
    border: "1px solid transparent",
    boxShadow: "var(--glow-amber)",
  },
  secondary: {
    background: "var(--surface-raised)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-strong)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid transparent",
  },
  danger: {
    background: "var(--danger)",
    color: "var(--paper)",
    border: "1px solid transparent",
  },
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  onClick,
  type = "button",
}: ButtonProps) {
  const s = SIZES[size];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="press"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-2)",
        height: s.height,
        minWidth: "var(--touch-min)",
        padding: s.padding,
        width: fullWidth ? "100%" : "auto",
        fontFamily: "var(--font-ui)",
        fontSize: s.font,
        fontWeight: "var(--weight-semibold)" as CSSProperties["fontWeight"],
        letterSpacing: "-0.01em",
        borderRadius: s.radius,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "transform var(--dur-fast) var(--ease-out), filter var(--dur-fast) var(--ease-out)",
        WebkitTapHighlightColor: "transparent",
        ...VARIANTS[variant],
      }}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
