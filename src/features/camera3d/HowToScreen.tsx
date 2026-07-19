import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Badge, Button, IconButton } from "@/components/ds";
import { useAppStore } from "@/app/store";
import { guideById, howtoById } from "@/features/guides/content";

export function HowToScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const setLastHowTo = useAppStore((s) => s.setLastHowTo);
  const howto = id ? howtoById(id) : undefined;

  useEffect(() => {
    if (howto) setLastHowTo(howto.id);
  }, [howto, setLastHowTo]);

  if (!howto) {
    return (
      <div className="screen">
        <p style={{ color: "var(--text-secondary)" }}>How-To not found.</p>
        <Button variant="secondary" onClick={() => navigate("/camera")}>
          Back to Camera
        </Button>
      </div>
    );
  }

  const related = (howto.relatedGuideIds ?? [])
    .map((gid) => guideById(gid))
    .filter((g): g is NonNullable<typeof g> => g != null);

  return (
    <div className="screen">
      <header className="screen-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <IconButton icon={<ArrowLeft size={24} />} label="Back" onClick={() => navigate(-1)} />
          {howto.controlIds.slice(0, 3).map((c) => (
            <Badge key={c} size="sm" tone="teal">
              {c.replace(/-/g, " ")}
            </Badge>
          ))}
        </div>
      </header>

      <div className="display" style={{ fontSize: 28, lineHeight: 1.15 }}>
        {howto.title}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {howto.steps.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              padding: "14px",
              background: "var(--surface-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
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
            <span style={{ flex: 1, fontSize: 15, color: "var(--paper)", lineHeight: 1.45 }}>{s.text}</span>
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

      {howto.tip && (
        <div
          style={{
            padding: 14,
            background: "var(--accent-2-wash)",
            borderRadius: "var(--radius-md)",
            fontSize: 14,
            lineHeight: 1.5,
            color: "var(--paper-dim)",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--teal-400)" }}>Tip · </span>
          {howto.tip}
        </div>
      )}

      {related.length > 0 && (
        <>
          <span className="eyebrow">Used in</span>
          {related.map((g) => (
            <Button
              key={g.id}
              variant="secondary"
              fullWidth
              iconLeft={<BookOpen size={18} />}
              onClick={() => navigate(`/guides/${g.id}`)}
            >
              {g.title}
            </Button>
          ))}
        </>
      )}
    </div>
  );
}
