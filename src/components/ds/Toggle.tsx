/**
 * Toggle — iOS-style switch for Settings. On = corona amber, off = raised
 * surface. Matches the design system's accent + motion tokens.
 */
export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      style={{
        width: 52,
        height: 32,
        flex: "0 0 auto",
        borderRadius: "var(--radius-pill)",
        border: "none",
        padding: 3,
        cursor: "pointer",
        background: checked ? "var(--accent)" : "var(--surface-raised)",
        boxShadow: checked ? "var(--glow-amber)" : "inset 0 0 0 1px var(--border-strong)",
        transition: "background var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)",
        WebkitTapHighlightColor: "transparent",
        display: "flex",
        alignItems: "center",
      }}
    >
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: "var(--radius-pill)",
          background: checked ? "var(--text-on-accent)" : "var(--paper)",
          transform: checked ? "translateX(20px)" : "translateX(0)",
          transition: "transform var(--dur-base) var(--ease-out)",
          boxShadow: "0 1px 3px oklch(0 0 0 / 0.4)",
        }}
      />
    </button>
  );
}
