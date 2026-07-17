import React from "react";

/**
 * IconButton — square, ≥44px tappable icon control. Used in headers,
 * hotspot dismiss, capture retake, etc. Ghost by default; "accent" for
 * the round shutter-style capture button.
 */
export function IconButton({
  icon,
  label,
  variant = "ghost",
  size = 44,
  onClick,
  ...rest
}) {
  const variants = {
    ghost: { background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" },
    solid: { background: "var(--surface-raised)", color: "var(--text-primary)", border: "1px solid var(--border-strong)" },
    accent: { background: "var(--accent)", color: "var(--text-on-accent)", border: "1px solid transparent", boxShadow: "var(--glow-amber)" },
  }[variant];

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
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
        ...variants,
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      {...rest}
    >
      {icon}
    </button>
  );
}
