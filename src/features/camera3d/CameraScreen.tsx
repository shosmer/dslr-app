import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import { HOWTOS } from "@/features/guides/content";

/** Camera tab — How-To library now; the R3F 3D viewer replaces the striped
 *  stage once the D7100 model passes the sourcing gate (PRD §6, docs/TODO.md).
 *  Content is keyed by control id, so the 3D layer drops in without rework. */
export function CameraScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const results = q
    ? HOWTOS.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.controlIds.some((c) => c.includes(q)) ||
          h.steps.some((s) => s.text.toLowerCase().includes(q)),
      )
    : HOWTOS;

  return (
    <div className="screen">
      <div className="display" style={{ fontSize: 24 }}>
        Camera
      </div>

      <div className="stripe" style={{ height: 280, alignItems: "center", justifyContent: "center" }}>
        [ interactive 3D D7100 — model sourcing gate, PRD §6 ]
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 14px",
          height: 48,
          background: "var(--surface-sunken)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-pill)",
        }}
      >
        <Search size={18} style={{ color: "var(--text-tertiary)", flex: "0 0 auto" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search How-Tos — try “ISO”"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-primary)",
            fontFamily: "var(--font-ui)",
            fontSize: "var(--text-body)",
          }}
        />
      </div>

      <span className="eyebrow">How-To library · {HOWTOS.length} recipes</span>
      {results.map((h) => (
        <button
          key={h.id}
          type="button"
          onClick={() => navigate(`/camera/howto/${h.id}`)}
          className="press"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            background: "var(--surface-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            textAlign: "left",
            minHeight: "var(--touch-min)",
            transition: "transform var(--dur-fast) var(--ease-out)",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span style={{ color: "var(--paper)", fontSize: 15, fontWeight: 500 }}>{h.title}</span>
          <span style={{ color: "var(--text-tertiary)", flex: "0 0 auto" }}>
            <ChevronRight size={18} />
          </span>
        </button>
      ))}
      {results.length === 0 && (
        <p style={{ color: "var(--text-tertiary)", fontSize: 14, textAlign: "center", margin: "12px 0" }}>
          Nothing matches "{query}".
        </p>
      )}
    </div>
  );
}
