import { Suspense, lazy, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ds";
import { BottomSheet } from "@/components/BottomSheet";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { HOWTOS } from "@/features/guides/content";
import { HOTSPOTS, type Hotspot } from "./hotspots";

// Code-split the whole three.js stack so it can't block or crash the app —
// a WebGL failure is caught by the ErrorBoundary and falls back to the list.
const WireframeViewer = lazy(() => import("./WireframeViewer").then((m) => ({ default: m.WireframeViewer })));

const MODEL_SRC = "/models/d7100.glb";

function hasWebGL2(): boolean {
  try {
    return typeof window !== "undefined" && !!window.WebGL2RenderingContext && !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

/** Camera tab — interactive 3D D7100 (F1). The splat is a placeholder until
 *  Shanny's real scan lands. If WebGL/3D fails on the device, it degrades to a
 *  tappable list of the same controls (content is render-agnostic). */
export function CameraScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Hotspot | null>(null);
  const webgl = hasWebGL2();

  const q = query.trim().toLowerCase();
  const results = q
    ? HOWTOS.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.controlIds.some((c) => c.includes(q)) ||
          h.steps.some((s) => s.text.toLowerCase().includes(q)),
      )
    : HOWTOS;

  const controlList = (
    <div>
      <div
        className="stripe"
        style={{ height: 120, alignItems: "center", justifyContent: "center", marginBottom: 12 }}
      >
        [ tap a control below ]
      </div>
      <span className="eyebrow">Controls · {HOTSPOTS.length}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        {HOTSPOTS.map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => setSelected(h)}
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
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{ color: "var(--paper)", fontSize: 15, fontWeight: 500 }}>{h.label}</span>
            <span style={{ color: "var(--text-tertiary)", flex: "0 0 auto" }}>
              <ChevronRight size={18} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="screen">
      <header className="screen-header">
        <div className="display" style={{ fontSize: 24 }}>
          Camera
        </div>
      </header>

      {webgl ? (
        <ErrorBoundary fallback={controlList}>
          <Suspense
            fallback={
              <div
                className="stripe"
                style={{ height: 320, alignItems: "center", justifyContent: "center" }}
              >
                [ loading 3D viewer… ]
              </div>
            }
          >
            <WireframeViewer
              src={MODEL_SRC}
              hotspots={HOTSPOTS}
              onSelect={setSelected}
              selectedId={selected?.id ?? null}
            />
          </Suspense>
        </ErrorBoundary>
      ) : (
        controlList
      )}
      <p style={{ margin: "-6px 4px 0", fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.4 }}>
        Your D7100 — drag to orbit, tap a control to learn it.
      </p>

      {/* Hotspot detail card */}
      <BottomSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.label}>
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "var(--paper)" }}>{selected.what}</p>
            {selected.when && (
              <div>
                <span className="eyebrow" style={{ display: "block", marginBottom: 4 }}>
                  When you'd use it
                </span>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--text-secondary)" }}>
                  {selected.when}
                </p>
              </div>
            )}
            {selected.howtoId && (
              <Button
                variant="secondary"
                fullWidth
                iconRight={<ArrowRight size={18} />}
                onClick={() => {
                  const id = selected.howtoId;
                  setSelected(null);
                  navigate(`/camera/howto/${id}`);
                }}
              >
                Show me how
              </Button>
            )}
          </div>
        )}
      </BottomSheet>

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
