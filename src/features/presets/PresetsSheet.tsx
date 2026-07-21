import { Bookmark, Trash2 } from "lucide-react";
import { Badge, RecipeTable } from "@/components/ds";
import { BottomSheet } from "@/components/BottomSheet";
import { useAppStore } from "@/app/store";

/** Saved presets, shown as a bottom sheet over Analyze (bookmark icon).
 *  View a recipe, edit its field note, or delete it — without leaving Analyze. */
export function PresetsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const presets = useAppStore((s) => s.presets);
  const removePreset = useAppStore((s) => s.removePreset);
  const updatePresetNote = useAppStore((s) => s.updatePresetNote);

  return (
    <BottomSheet open={open} onClose={onClose} title={`Saved recipes${presets.length ? ` · ${presets.length}` : ""}`}>
      {presets.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            padding: "24px 12px 32px",
            textAlign: "center",
          }}
        >
          <span style={{ color: "var(--text-tertiary)" }}>
            <Bookmark size={28} />
          </span>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)" }}>
            No saved recipes yet. Tap <strong style={{ color: "var(--paper)" }}>Save as preset</strong> on any analyzer
            result or guide, and it lands here — named, offline, one tap from the field.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {presets.map((p) => (
            <div
              key={p.id}
              style={{
                background: "var(--surface-sunken)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-4)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: "var(--paper)", fontSize: 15 }}>{p.name}</div>
                  <span className="eyebrow">{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {p.source !== "analyzer" && <Badge size="sm">{p.source.replace(/-/g, " ")}</Badge>}
                  <button
                    type="button"
                    aria-label="Delete preset"
                    onClick={() => removePreset(p.id)}
                    className="press-icon"
                    style={{
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "var(--radius-pill)",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <RecipeTable rows={p.rows} />
              <textarea
                defaultValue={p.note ?? ""}
                placeholder="Field note — what worked, what didn't"
                onBlur={(e) => updatePresetNote(p.id, e.target.value)}
                rows={2}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  marginTop: 10,
                  padding: "10px 12px",
                  background: "var(--surface-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "var(--text-sm)",
                  resize: "vertical",
                }}
              />
            </div>
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
