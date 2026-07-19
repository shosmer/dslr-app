import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Badge, Card } from "@/components/ds";
import { GUIDES } from "./content";

export function GuidesScreen() {
  const navigate = useNavigate();
  const core = GUIDES.filter((g) => g.pack === "core");
  const iceland = GUIDES.filter((g) => g.pack === "iceland");

  const section = (label: string, guides: typeof GUIDES) => (
    <>
      <span className="eyebrow" style={{ marginTop: guides === iceland ? 8 : 0 }}>
        {label} · {guides.length}
      </span>
      {guides.map((g) => (
        <Card key={g.id} interactive padding="var(--space-4)" onClick={() => navigate(`/guides/${g.id}`)}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: "var(--paper)", fontSize: 16, marginBottom: 3 }}>{g.title}</div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-tertiary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {g.summary}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                {g.pack === "iceland" && (
                  <Badge tone="teal" size="sm">
                    Iceland pack
                  </Badge>
                )}
                {g.locations.slice(0, 2).map((l) => (
                  <Badge key={l} size="sm">
                    {l}
                  </Badge>
                ))}
              </div>
            </div>
            <span style={{ color: "var(--text-tertiary)", flex: "0 0 auto" }}>
              <ChevronRight size={18} />
            </span>
          </div>
        </Card>
      ))}
    </>
  );

  return (
    <div className="screen">
      <header className="screen-header">
        <div>
          <div className="display" style={{ fontSize: 24 }}>
            Guides
          </div>
          <div className="eyebrow" style={{ marginTop: 4 }}>
            Recipe-first · works offline
          </div>
        </div>
      </header>
      {section("Core lighting challenges", core)}
      {section("Iceland pack", iceland)}
    </div>
  );
}
