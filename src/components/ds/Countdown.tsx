import type { CSSProperties } from "react";

/**
 * Countdown — big mono tabular-nums clock for eclipse timing and hero numbers.
 * Ported from the design-system source (in sync with ui_kits/ljosmynd/index.html).
 */
export interface CountdownProps {
  /** preformatted value, e.g. "26d 04:11:52" or "01:47" */
  value: string;
  label?: string | null;
  tone?: "amber" | "teal" | "danger" | "paper";
  size?: "lg" | "md" | "sm";
}

const COLORS: Record<string, string> = {
  amber: "var(--amber-500)",
  teal: "var(--teal-500)",
  danger: "var(--danger)",
  paper: "var(--paper)",
};

export function Countdown({ value, label = null, tone = "amber", size = "lg" }: CountdownProps) {
  const fontSize =
    size === "lg" ? "var(--text-display-xl)" : size === "md" ? "var(--text-display)" : "var(--text-h1)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            letterSpacing: "var(--tracking-caps)",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
          }}
        >
          {label}
        </span>
      )}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize,
          fontWeight: "var(--weight-semibold)" as CSSProperties["fontWeight"],
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.01em",
          lineHeight: "var(--leading-tight)",
          color: COLORS[tone],
        }}
      >
        {value}
      </span>
    </div>
  );
}
