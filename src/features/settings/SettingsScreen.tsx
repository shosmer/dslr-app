import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Download, Eclipse, Upload } from "lucide-react";
import { Badge, Button, Card, IconButton, SegmentedControl, Toggle } from "@/components/ds";
import { useAppStore, type DestinationId, type Preset } from "@/app/store";
import { BODY, LENSES } from "@/data/gear";
import { SPOTS } from "@/features/eclipse/timeline";

const DESTINATIONS: { value: DestinationId; label: string }[] = [
  { value: "iceland-2026", label: "Iceland 2026" },
  { value: "none", label: "Everyday" },
];

function SectionTitle({ children }: { children: string }) {
  return (
    <span className="eyebrow" style={{ display: "block", marginTop: 8 }}>
      {children}
    </span>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "14px 16px",
        minHeight: "var(--touch-min)",
        borderTop: "1px solid var(--border)",
      }}
    >
      {children}
    </div>
  );
}

export function SettingsScreen() {
  const navigate = useNavigate();
  const importRef = useRef<HTMLInputElement>(null);

  const activeLensIds = useAppStore((s) => s.activeLensIds);
  const toggleLens = useAppStore((s) => s.toggleLens);
  const destinationId = useAppStore((s) => s.destinationId);
  const setDestination = useAppStore((s) => s.setDestination);
  const eclipseEnabled = useAppStore((s) => s.eclipseEnabled);
  const setEclipseEnabled = useAppStore((s) => s.setEclipseEnabled);
  const eclipseSpotId = useAppStore((s) => s.eclipseSpotId);
  const setEclipseSpot = useAppStore((s) => s.setEclipseSpot);
  const presets = useAppStore((s) => s.presets);
  const checklist = useAppStore((s) => s.checklist);
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
            Settings
          </div>
        </div>
      </header>

      {/* ── Camera & lenses ── */}
      <SectionTitle>Camera & lenses</SectionTitle>
      <Card tone="sunken" padding="0">
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 600, color: "var(--paper)", fontSize: 15 }}>{BODY.name}</div>
            <span className="eyebrow">{BODY.sensor.format} · {BODY.sensor.mp}MP</span>
          </div>
          <span style={{ color: "var(--safe)", display: "flex" }}>
            <Check size={20} />
          </span>
        </div>
        {LENSES.map((lens) => {
          const on = activeLensIds.includes(lens.id);
          return (
            <Row key={lens.id}>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: "var(--paper)", fontSize: 15, display: "flex", gap: 8, alignItems: "center" }}>
                  {lens.shortName}
                  {lens.placeholder && <Badge size="sm">Placeholder</Badge>}
                </div>
                <span className="eyebrow">{lens.name}</span>
              </div>
              <Toggle checked={on} onChange={() => toggleLens(lens.id)} label={lens.shortName} />
            </Row>
          );
        })}
      </Card>
      <p style={{ margin: "-4px 4px 0", fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.4 }}>
        Lenses you turn on appear in the Analyze picker and drive its recommendations.
      </p>

      {/* ── Trip ── */}
      <SectionTitle>Trip</SectionTitle>
      <SegmentedControl
        value={destinationId}
        onChange={(v) => setDestination(v as DestinationId)}
        options={DESTINATIONS}
      />
      <p style={{ margin: "-4px 4px 0", fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.4 }}>
        {destinationId === "iceland-2026"
          ? "Shows the Iceland guide pack and the day-by-day trip card on Home."
          : "Everyday mode — core lighting guides only, no trip card."}
      </p>

      {/* ── Eclipse ── */}
      <SectionTitle>Eclipse</SectionTitle>
      <Card tone="sunken" padding="0">
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: eclipseEnabled ? "var(--amber-500)" : "var(--text-tertiary)", display: "flex" }}>
              <Eclipse size={20} />
            </span>
            <div>
              <div style={{ fontWeight: 600, color: "var(--paper)", fontSize: 15 }}>Eclipse Mode</div>
              <span className="eyebrow">Aug 12, 2026 · Snæfellsnes</span>
            </div>
          </div>
          <Toggle checked={eclipseEnabled} onChange={setEclipseEnabled} label="Eclipse Mode" />
        </div>
      </Card>
      {eclipseEnabled && (
        <>
          <span className="eyebrow" style={{ display: "block" }}>
            Viewing spot
          </span>
          <div
            style={{
              overflowX: "auto",
              scrollbarWidth: "none",
              margin: "0 calc(-1 * var(--space-5))",
              padding: "0 var(--space-5)",
            }}
          >
            <SegmentedControl
              value={eclipseSpotId}
              onChange={setEclipseSpot}
              options={SPOTS.map((s) => ({ value: s.id, label: s.name }))}
              fullWidth={false}
            />
          </div>
        </>
      )}

      {/* ── Backup ── */}
      <SectionTitle>Backup</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Button variant="secondary" iconLeft={<Download size={18} />} onClick={exportAll}>
          Export
        </Button>
        <Button variant="secondary" iconLeft={<Upload size={18} />} onClick={() => importRef.current?.click()}>
          Import
        </Button>
      </div>
      <input
        ref={importRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={(e) => void importFile(e.target.files?.[0])}
      />
      {status && (
        <p style={{ margin: 0, textAlign: "center", fontSize: 13, color: "var(--text-tertiary)" }}>{status}</p>
      )}
      <p style={{ margin: "0 4px 8px", fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.4 }}>
        Presets and checklist are stored on this device only. Export saves a file you can re-import as a backup.
      </p>
    </div>
  );
}
