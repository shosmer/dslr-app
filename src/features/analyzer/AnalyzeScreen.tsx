import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Camera, Sparkles, TriangleAlert, Wifi, WifiOff } from "lucide-react";
import { Badge, Button, Card, RecipeTable, SegmentedControl } from "@/components/ds";
import { useAppStore, type IntentId } from "@/app/store";
import { BODY, LENSES, lensById } from "@/data/gear";
import { analyzeCapture, type AnalysisResult } from "./engine/analyze";
import { enhanceWithAI, type AiEnhancement } from "./ai/enhance";

const INTENTS: { value: IntentId; label: string }[] = [
  { value: "landscape", label: "Landscape" },
  { value: "portrait", label: "Portrait" },
  { value: "action", label: "Action" },
  { value: "waterfall", label: "Waterfall" },
  { value: "lowlight", label: "Low light" },
];

export function AnalyzeScreen() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const intent = useAppStore((s) => s.intent);
  const setIntent = useAppStore((s) => s.setIntent);
  const mountedLensId = useAppStore((s) => s.mountedLensId);
  const setMountedLens = useAppStore((s) => s.setMountedLens);
  const addHistory = useAppStore((s) => s.addHistory);
  const addPreset = useAppStore((s) => s.addPreset);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [ai, setAi] = useState<AiEnhancement | null>(null);
  const [aiState, setAiState] = useState<"idle" | "busy" | "failed">("idle");

  const lens = lensById(mountedLensId);

  const run = async (f: File, intentOverride?: IntentId) => {
    setBusy(true);
    setAi(null);
    setAiState("idle");
    try {
      const r = await analyzeCapture(f, intentOverride ?? intent, lens, BODY);
      setResult(r);
      addHistory({
        id: Date.now().toString(36),
        at: new Date().toISOString(),
        thumb: r.thumb,
        summary: `${r.ev != null ? `EV ${r.ev.toFixed(1)}` : "No EXIF"} · ${r.sceneLabel.toLowerCase()}`,
      });
    } finally {
      setBusy(false);
    }
  };

  const onPick = (f: File | undefined | null) => {
    if (!f) return;
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
    void run(f);
  };

  const onIntent = (v: string) => {
    setIntent(v as IntentId);
    if (file) void run(file, v as IntentId);
  };

  const onLens = (v: string) => {
    setMountedLens(v);
    if (file) setTimeout(() => void run(file), 0);
  };

  const onEnhance = async () => {
    if (!file || !result) return;
    setAiState("busy");
    try {
      const top = result.combos[0];
      setAi(
        await enhanceWithAI(file, {
          intent,
          lensName: lens.name,
          localSummary: `${result.sceneLabel}; ${top.rows.map((r) => `${r.label} ${r.value}`).join(", ")}`,
        }),
      );
      setAiState("idle");
    } catch {
      setAi(null);
      setAiState("failed");
    }
  };

  const top = result?.combos[0];
  const alt = result?.combos[1];

  return (
    <div className="screen">
      <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div className="display" style={{ fontSize: 24 }}>
          Analyze
        </div>
        {result && (
          <Badge tone="safe" icon={<WifiOff size={13} />}>
            Offline · {(result.elapsedMs / 1000).toFixed(1)}s
          </Badge>
        )}
      </header>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(e) => onPick(e.target.files?.[0])}
      />

      {previewUrl ? (
        <div
          className="press"
          onClick={() => inputRef.current?.click()}
          style={{
            height: 150,
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            backgroundImage: `url(${previewUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            cursor: "pointer",
            transition: "transform var(--dur-fast) var(--ease-out)",
          }}
        >
          <span
            className="eyebrow"
            style={{
              position: "absolute",
              left: 12,
              bottom: 12,
              background: "oklch(0.13 0.006 60 / 0.7)",
              padding: "4px 8px",
              borderRadius: "var(--radius-xs)",
            }}
          >
            {busy
              ? "analyzing…"
              : result
                ? `${result.ev != null ? `EV ${result.ev.toFixed(1)}` : "no EXIF"} · ${result.evLabel} · tap to retake`
                : "tap to retake"}
          </span>
          <div style={{ position: "absolute", top: 12, right: 12 }}>
            <Badge>{lens.shortName}</Badge>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="stripe press"
          onClick={() => inputRef.current?.click()}
          style={{
            height: 180,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 10,
            cursor: "pointer",
            width: "100%",
            transition: "transform var(--dur-fast) var(--ease-out)",
          }}
        >
          <Camera size={30} style={{ color: "var(--amber-500)" }} />
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--paper)", fontWeight: 600 }}>
            Snap the scene
          </span>
          <span>settings for this light, in under 2 seconds — offline</span>
        </button>
      )}

      <div>
        <span className="eyebrow" style={{ display: "block", marginBottom: 6 }}>
          Mounted lens
        </span>
        <SegmentedControl
          value={mountedLensId}
          onChange={onLens}
          options={LENSES.map((l) => ({ value: l.id, label: l.shortName }))}
        />
      </div>

      <div>
        <span className="eyebrow" style={{ display: "block", marginBottom: 6 }}>
          What are you shooting?
        </span>
        <div style={{ overflowX: "auto", scrollbarWidth: "none", margin: "0 calc(-1 * var(--space-5))", padding: "0 var(--space-5)" }}>
          <SegmentedControl value={intent} onChange={onIntent} options={INTENTS} fullWidth={false} />
        </div>
      </div>

      {top && (
        <Card tone="amber" glow>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
            <span className="eyebrow" style={{ color: "var(--amber-400)" }}>
              Recommended · #1
            </span>
            <Badge tone="amber">{result!.sceneLabel}</Badge>
          </div>
          <RecipeTable rows={top.rows} />
          <p style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.5, color: "var(--text-secondary)" }}>
            <strong style={{ color: "var(--paper)" }}>Why:</strong> {top.why}
          </p>
          {top.warnings.map((w, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 12,
                padding: "10px 12px",
                background: "var(--warn-tint)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <span style={{ color: "var(--warn)", flex: "0 0 auto" }}>
                <TriangleAlert size={18} />
              </span>
              <span style={{ fontSize: 13, color: "var(--paper-dim)" }}>{w}</span>
            </div>
          ))}
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {top.howtoIds.slice(0, 2).map((h) => (
              <Button
                key={h}
                variant="secondary"
                size="sm"
                iconRight={<ArrowRight size={16} />}
                onClick={() => navigate(`/camera/howto/${h}`)}
              >
                How to set {h.replace(/-/g, " ").replace("btn", "").trim()}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {alt && (
        <Card padding="var(--space-4)">
          <span className="eyebrow">Alternate · #2 — {alt.title.toLowerCase()}</span>
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 10,
              fontFamily: "var(--font-mono)",
              fontSize: 15,
              color: "var(--paper)",
              flexWrap: "wrap",
            }}
          >
            {alt.rows
              .filter((r) => ["Aperture", "Shutter", "ISO"].includes(r.label))
              .map((r, i) => (
                <span key={r.label} style={{ display: "inline-flex", gap: 10 }}>
                  {i > 0 && <span style={{ color: "var(--border-strong)" }}>·</span>}
                  {r.label === "ISO" ? `ISO ${r.value}` : r.value.replace(" (auto)", "")}
                </span>
              ))}
          </div>
        </Card>
      )}

      {result && (
        <Button
          variant="secondary"
          fullWidth
          onClick={() => {
            addPreset({
              id: `analyzer-${Date.now().toString(36)}`,
              name: `${result.sceneLabel} · ${lens.shortName}`,
              createdAt: new Date().toISOString(),
              source: "analyzer",
              lensId: lens.id,
              rows: top!.rows,
            });
          }}
        >
          Save as preset
        </Button>
      )}

      {result && !ai && (
        <>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            iconLeft={<Sparkles size={20} />}
            onClick={onEnhance}
            disabled={aiState === "busy" || !navigator.onLine}
          >
            {aiState === "busy" ? "Asking Claude…" : "Enhance with AI"}
          </Button>
          <p style={{ margin: "-6px 0 0", textAlign: "center", fontSize: 12, color: "var(--text-tertiary)" }}>
            {aiState === "failed"
              ? "AI unavailable — the local result above stands on its own"
              : !navigator.onLine
                ? "Offline — local analysis is all you need in the field"
                : "Sends a downscaled copy · works without it"}
          </p>
        </>
      )}

      {ai && (
        <Card tone="teal">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span className="eyebrow" style={{ color: "var(--teal-400)" }}>
              AI read of the scene
            </span>
            <Badge tone="teal" icon={<Wifi size={13} />}>
              Online
            </Badge>
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--paper)" }}>{ai.sceneDescription}</p>
          <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)" }}>
            {ai.refinement}
          </p>
          {ai.pitfalls.map((p, i) => (
            <p key={i} style={{ margin: "8px 0 0", fontSize: 13, color: "var(--paper-dim)" }}>
              · {p}
            </p>
          ))}
        </Card>
      )}
    </div>
  );
}
