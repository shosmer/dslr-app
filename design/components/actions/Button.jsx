import React from "react";

/**
 * Button — the primary field action. Big, high-contrast, thumb-reachable.
 * Corona-amber fill for the one primary action per view; teal for secondary
 * emphasis; ghost for low-priority; danger for eye-safety / destructive.
 */
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
  ...rest
}) {
  const sizes = {
    sm: { height: 40, padding: "0 16px", font: "var(--text-sm)", radius: "var(--radius-sm)" },
    md: { height: 48, padding: "0 22px", font: "var(--text-body)", radius: "var(--radius-md)" },
    lg: { height: "var(--touch-lg)", padding: "0 28px", font: "var(--text-body-lg)", radius: "var(--radius-md)" },
  }[size];

  const variants = {
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
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-2)",
        height: sizes.height,
        minWidth: "var(--touch-min)",
        padding: sizes.padding,
        width: fullWidth ? "100%" : "auto",
        fontFamily: "var(--font-ui)",
        fontSize: sizes.font,
        fontWeight: "var(--weight-semibold)",
        letterSpacing: "-0.01em",
        borderRadius: sizes.radius,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "transform var(--dur-fast) var(--ease-out), filter var(--dur-fast) var(--ease-out)",
        WebkitTapHighlightColor: "transparent",
        ...variants,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
