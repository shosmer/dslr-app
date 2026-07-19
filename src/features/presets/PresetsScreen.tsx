import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Trash2, Upload } from "lucide-react";
import { Badge, Button, Card, IconButton, RecipeTable } from "@/components/ds";
import { useAppStore, type Preset } from "@/app/store";

/** F6 — Presets & field notes. Local-only (IndexedDB) with one-tap JSON
 *  export/import for backup (PRD §10). */
export function PresetsScreen() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const presets = useAppStore((s) => s.presets);
  const checklist = useAppStore((s) => s.checklist);
  const removePreset = useAppStore((s) => s.removePreset);
  const updatePresetNote = useAppStore((s) => s.updatePresetNote);
  const importState = useAppStore((s) => s.importState);
  const [status, setStatus] = useState<string | null>(null);

  const exportAll = () => {
    const blob = new Blob([JSON.stringify({ version: 1, presets, checklist }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ljosmynd-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = async (f: File | undefined | null) => {
    if (!f) return;
    try {
      const data = JSON.parse(await f.text()) as { presets?: Preset[]; checklist?: Record<string, boolean> };
      if (!Array.isArray(data.presets)) throw new Error("bad file");
      importState({ presets: data.presets, checklist: data.checklist ?? {} });
      setStatus(`Imported ${data.presets.length} presets`);
    } catch {
      setStatus("That file isn't a Ljósmynd backup");
    }
  };

  return (
    <div className="screen">
      <header className="screen-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <IconButton icon={<ArrowLeft size={24} />} label="Back" onClick={() => navigate(-1)} />
          <div className="display" style={{ fontSize: 22 }}>
            Presets & notes
          </div>
        </div>
      </header>

      {presets.length === 0 && (
        <Card tone="sunken">
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)" }}>
            Nothing saved yet. Save a recipe from any guide or analyzer result and it lands here — named,
            offline, one tap from the field.
          </p>
        </Card>
      )}

      {presets.map((p) => (
        <Card key={p.id} padding="var(--space-4)">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: "var(--paper)", fontSize: 15 }}>{p.name}</div>
              <span className="eyebrow">{new Date(p.createdAt).toLocaleDateString()}</span>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {p.source !== "analyzer" && <Badge size="sm">{p.source.replace(/-/g, " ")}</Badge>}
              <IconButton icon={<Trash2 size={18} />} label="Delete preset" onClick={() => removePreset(p.id)} />
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
              background: "var(--surface-sunken)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-ui)",
              fontSize: "var(--text-sm)",
              resize: "vertical",
            }}
          />
        </Card>
      ))}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Button variant="secondary" iconLeft={<Download size={18} />} onClick={exportAll}>
          Export
        </Button>
        <Button variant="secondary" iconLeft={<Upload size={18} />} onClick={() => inputRef.current?.click()}>
          Import
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={(e) => void importFile(e.target.files?.[0])}
      />
      {status && (
        <p style={{ margin: 0, textAlign: "center", fontSize: 13, color: "var(--text-tertiary)" }}>{status}</p>
      )}
    </div>
  );
}
