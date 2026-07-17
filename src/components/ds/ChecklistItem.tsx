import type { CSSProperties } from "react";

/**
 * ChecklistItem — eclipse-prep / packing checklist row. ≥44px target,
 * amber check, line-through when done, warn-tinted detail when urgent.
 * Ported from the design-system source (in sync with ui_kits/ljosmynd/index.html).
 */
export interface ChecklistItemProps {
  label: string;
  detail?: string | null;
  checked?: boolean;
  urgent?: boolean;
  onToggle?: () => void;
}

export function ChecklistItem({ label, detail = null, checked = false, urgent = false, onToggle }: ChecklistItemProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="checkbox"
      aria-checked={checked}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        width: "100%",
        minHeight: "var(--touch-min)",
        padding: "var(--space-3) var(--space-4)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        borderRadius: "var(--radius-sm)",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span
        style={{
          flex: "0 0 auto",
          width: 26,
          height: 26,
          borderRadius: "var(--radius-sm)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: checked ? "var(--accent)" : "transparent",
          border: checked ? "1px solid transparent" : "1.5px solid var(--border-strong)",
          color: "var(--text-on-accent)",
          transition: "all var(--dur-fast) var(--ease-out)",
        }}
      >
        {checked && (
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
        <span
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "var(--text-body)",
            fontWeight: "var(--weight-medium)" as CSSProperties["fontWeight"],
            color: checked ? "var(--text-tertiary)" : "var(--text-primary)",
            textDecoration: checked ? "line-through" : "none",
          }}
        >
          {label}
        </span>
        {detail && (
          <span
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "var(--text-xs)",
              color: urgent ? "var(--warn)" : "var(--text-tertiary)",
            }}
          >
            {detail}
          </span>
        )}
      </span>
    </button>
  );
}
