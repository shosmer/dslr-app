import type { CSSProperties } from "react";

/**
 * RecipeTable — the exposure-triangle settings block that appears in every
 * guide, recommendation, and eclipse phase. Renders aperture / shutter / ISO
 * (and any extra rows) as a mono, high-contrast, scannable table. This is the
 * signature data component of the app.
 * Ported from design/components/display/RecipeTable.jsx.
 */
export interface RecipeRow {
  label: string;
  /** mono value, e.g. "f/8", "1/1000s", "ISO 200" */
  value: string;
  /** render the value in the accent color (the setting that matters most here) */
  highlight?: boolean;
}

export interface RecipeTableProps {
  title?: string | null;
  rows: RecipeRow[];
  accent?: "amber" | "teal";
}

export function RecipeTable({ title = null, rows, accent = "amber" }: RecipeTableProps) {
  const accentColor = accent === "teal" ? "var(--teal-500)" : "var(--amber-500)";
  return (
    <div
      style={{
        background: "var(--surface-sunken)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
      }}
    >
      {title && (
        <div
          style={{
            padding: "10px 16px",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "var(--tracking-caps)",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {title}
        </div>
      )}
      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            padding: "12px 16px",
            borderTop: i === 0 ? "none" : "1px solid var(--border)",
          }}
        >
          <span style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            {r.label}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-body)",
              fontWeight: "var(--weight-semibold)" as CSSProperties["fontWeight"],
              color: r.highlight ? accentColor : "var(--text-primary)",
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
            }}
          >
            {r.value}
          </span>
        </div>
      ))}
    </div>
  );
}
