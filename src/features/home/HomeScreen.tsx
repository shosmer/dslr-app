import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Download, Eclipse, Rotate3d, ScanLine, Settings } from "lucide-react";
import { Badge, Button, Card, ChecklistItem, Countdown, IconButton } from "@/components/ds";
import { useAppStore } from "@/app/store";
import { formatCountdown, localISODate, useNow } from "@/lib/time";
import { ECLIPSE_C2 } from "@/features/eclipse/timeline";
import { ECLIPSE_CHECKLIST } from "@/features/eclipse/checklist";
import { tripDayFor } from "./trip";
import { downloadEverything } from "@/lib/tripmode";

export function HomeScreen() {
  const navigate = useNavigate();
  const now = useNow(1000);
  const checklist = useAppStore((s) => s.checklist);
  const toggleChecklist = useAppStore((s) => s.toggleChecklist);
  const lastHowToId = useAppStore((s) => s.lastHowToId);
  const [tripMode, setTripMode] = useState<string | null>(null);

  const today = tripDayFor(localISODate(new Date(now)));
  const doneCount = ECLIPSE_CHECKLIST.filter((c) => checklist[c.id]).length;
  const nextItems = [
    ...ECLIPSE_CHECKLIST.filter((c) => !checklist[c.id]).slice(0, 2),
    ...ECLIPSE_CHECKLIST.filter((c) => checklist[c.id]).slice(0, 1),
  ].slice(0, 2);

  const onTripMode = async () => {
    setTripMode("Downloading…");
    setTripMode(await downloadEverything());
  };

  return (
    <div className="screen">
      <header className="screen-header">
        <div>
          <div className="display" style={{ fontSize: 26 }}>
            Ljósmynd
          </div>
          <div className="eyebrow">Nikon D7100 · Iceland '26</div>
        </div>
        <IconButton icon={<Settings size={24} />} label="Presets & settings" onClick={() => navigate("/presets")} />
      </header>

      <Card tone="amber" glow>
        <div style={{ marginBottom: 10 }}>
          <Badge tone="amber" icon={<Eclipse size={13} />}>
            Total solar eclipse
          </Badge>
        </div>
        <Countdown
          label="Totality · Snæfellsnes · Aug 12, 17:45:46"
          value={formatCountdown(ECLIPSE_C2.getTime() - now)}
          tone="amber"
          size="md"
        />
        <div style={{ marginTop: 16 }}>
          <Button variant="primary" fullWidth iconLeft={<Eclipse size={18} />} onClick={() => navigate("/eclipse")}>
            Open Eclipse Mode
          </Button>
        </div>
      </Card>

      {today && (
        <Card
          interactive={today.day.guideIds.length > 0}
          onClick={
            today.day.guideIds.length > 0 ? () => navigate(`/guides/${today.day.guideIds[0]}`) : undefined
          }
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="eyebrow">
              {today.upcoming ? "Next up in Iceland" : `Today in Iceland · Day ${today.day.day}`}
            </span>
            <Badge tone="teal">{today.day.location}</Badge>
          </div>
          <div className="display" style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
            {today.day.title}
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.5, color: "var(--text-secondary)" }}>
            {today.day.blurb}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {today.day.tags.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card interactive onClick={() => navigate("/analyze")} padding="var(--space-4)">
          <div style={{ color: "var(--amber-500)", marginBottom: 10 }}>
            <ScanLine size={26} />
          </div>
          <div style={{ fontWeight: 600, color: "var(--paper)", fontSize: 16 }}>Analyze light</div>
          <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Snap → settings</div>
        </Card>
        <Card
          interactive
          onClick={() => navigate(lastHowToId ? `/camera/howto/${lastHowToId}` : "/camera")}
          padding="var(--space-4)"
        >
          <div style={{ color: "var(--teal-500)", marginBottom: 10 }}>
            <Rotate3d size={26} />
          </div>
          <div style={{ fontWeight: 600, color: "var(--paper)", fontSize: 16 }}>
            {lastHowToId ? "Resume How-To" : "Learn the body"}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
            {lastHowToId ? "Pick up where you left off" : "Dials, buttons, How-Tos"}
          </div>
        </Card>
      </div>

      <Card tone="sunken" padding="var(--space-4)" interactive onClick={() => navigate("/eclipse")}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span className="eyebrow">
            Eclipse prep · {doneCount} of {ECLIPSE_CHECKLIST.length}
          </span>
          <span style={{ color: "var(--text-tertiary)" }}>
            <ChevronRight size={18} />
          </span>
        </div>
        {nextItems.map((c) => (
          <div key={c.id} onClick={(e) => e.stopPropagation()}>
            <ChecklistItem
              label={c.label}
              detail={c.detail}
              urgent={c.urgent}
              checked={!!checklist[c.id]}
              onToggle={() => toggleChecklist(c.id)}
            />
          </div>
        ))}
      </Card>

      <Button variant="secondary" fullWidth iconLeft={<Download size={18} />} onClick={onTripMode}>
        {tripMode ?? "Trip mode — download everything"}
      </Button>
    </div>
  );
}
