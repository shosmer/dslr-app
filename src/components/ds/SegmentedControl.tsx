import type { CSSProperties } from "react";

/**
 * SegmentedControl — pill option group (lens/intent pickers, spot selector).
 * Ported from the design-system source (in sync with ui_kits/ljosmynd/index.html).
 */
export type SegmentOption = string | { value: string; label: string };

export interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange?: (value: string) => void;
  fullWidth?: boolean;
}

export function SegmentedControl({ options, value, onChange, fullWidth = true }: SegmentedControlProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        width: fullWidth ? "100%" : "auto",
        padding: "4px",
        background: "var(--surface-sunken)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-pill)",
        gap: "2px",
      }}
    >
      {options.map((opt) => {
        const val = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        const active = val === value;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange?.(val)}
            style={{
              flex: fullWidth ? 1 : "0 0 auto",
              height: 40,
              padding: "0 16px",
              border: "none",
              borderRadius: "var(--radius-pill)",
              cursor: "pointer",
              fontFamily: "var(--font-ui)",
              fontSize: "var(--text-sm)",
              fontWeight: (active
                ? "var(--weight-semibold)"
                : "var(--weight-medium)") as CSSProperties["fontWeight"],
              background: active ? "var(--accent-wash)" : "transparent",
              color: active ? "var(--amber-400)" : "var(--text-tertiary)",
              boxShadow: active ? "inset 0 0 0 1px oklch(0.80 0.145 75 / 0.4)" : "none",
              transition: "all var(--dur-base) var(--ease-out)",
              WebkitTapHighlightColor: "transparent",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
