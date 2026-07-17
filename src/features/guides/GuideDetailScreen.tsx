import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, TriangleAlert } from "lucide-react";
import { Badge, Button, Card, IconButton, RecipeTable } from "@/components/ds";
import { useAppStore } from "@/app/store";
import { guideById } from "./content";

export function GuideDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addPreset = useAppStore((s) => s.addPreset);
  const presets = useAppStore((s) => s.presets);
  const guide = id ? guideById(id) : undefined;

  if (!guide) {
    return (
      <div className="screen">
        <p style={{ color: "var(--text-secondary)" }}>Guide not found.</p>
        <Button variant="secondary" onClick={() => navigate("/guides")}>
          Back to Guides
        </Button>
      </div>
    );
  }

  const saved = presets.some((p) => p.source === guide.id);
  const savePreset = () => {
    if (saved) return;
    addPreset({
      id: `${guide.id}-${Date.now().toString(36)}`,
      name: guide.title,
      createdAt: new Date().toISOString(),
      source: guide.id,
      rows: guide.recipe.rows,
    });
  };

  return (
    <div className="screen">
      <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <IconButton icon={<ArrowLeft size={24} />} label="Back" onClick={() => navigate(-1)} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {guide.pack === "iceland" && <Badge tone="teal">Iceland pack</Badge>}
          {guide.locations.slice(0, 2).map((l) => (
            <Badge key={l}>{l}</Badge>
          ))}
        </div>
      </header>

      <div>
        <div className="display" style={{ fontSize: 30, lineHeight: 1.1 }}>
          {guide.title}
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 16, lineHeight: 1.5, color: "var(--text-secondary)" }}>
          {guide.summary}
        </p>
      </div>

      <div>
        <span className="eyebrow">Why it happens</span>
        <p style={{ margin: "6px 0 0", fontSize: 15, lineHeight: 1.55, color: "var(--paper-dim)" }}>{guide.why}</p>
      </div>

      <div>
        <div className="display" style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          The D7100 recipe
        </div>
        <RecipeTable rows={guide.recipe.rows} accent={guide.recipe.accent ?? "amber"} />
      </div>

      <div>
        <div className="display" style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>
          Set it up
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {guide.steps.map((s, i) => (
            <div
              key={i}
              onClick={s.howtoId ? () => navigate(`/camera/howto/${s.howtoId}`) : undefined}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                padding: "12px 14px",
                background: "var(--surface-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                cursor: s.howtoId ? "pointer" : "default",
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  flex: "0 0 auto",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--accent-wash)",
                  color: "var(--amber-400)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </span>
              <span style={{ flex: 1, fontSize: 14, color: "var(--paper)" }}>{s.text}</span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--teal-400)",
                  flex: "0 0 auto",
                }}
              >
                {s.control}
              </span>
            </div>
          ))}
        </div>
      </div>

      {guide.pitfalls.map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: 14,
            background: "var(--warn-tint)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <span style={{ color: "var(--warn)", flex: "0 0 auto" }}>
            <TriangleAlert size={20} />
          </span>
          <div>
            <div style={{ fontWeight: 600, color: "var(--paper)", fontSize: 14, marginBottom: 2 }}>Watch out for</div>
            <span style={{ fontSize: 13, color: "var(--paper-dim)", lineHeight: 1.5 }}>{p}</span>
          </div>
        </div>
      ))}

      {guide.levelUp && (
        <Card tone="sunken" padding="var(--space-4)">
          <span className="eyebrow">Level up</span>
          <p style={{ margin: "6px 0 0", fontSize: 14, lineHeight: 1.55, color: "var(--paper-dim)" }}>
            {guide.levelUp}
          </p>
        </Card>
      )}

      <Button variant="secondary" fullWidth iconLeft={<Bookmark size={18} />} onClick={savePreset} disabled={saved}>
        {saved ? "Saved to presets" : "Save as preset"}
      </Button>
    </div>
  );
}
