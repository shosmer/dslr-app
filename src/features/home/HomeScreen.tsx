import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Eclipse, Rotate3d, ScanLine, Settings, TriangleAlert } from "lucide-react";
import { Badge, Button, Card, IconButton } from "@/components/ds";
import { LiveCountdown } from "@/components/LiveCountdown";
import { useAppStore } from "@/app/store";
import { localISODate, useNow } from "@/lib/time";
import { ECLIPSE_C2 } from "@/features/eclipse/timeline";
import { tripDayFor } from "./trip";
import { useOfflineReadiness } from "@/lib/offline";
import { viewportDebugLine } from "@/lib/viewport";

export function HomeScreen() {
  const navigate = useNavigate();
  // Minute tick is enough for the trip-day card; the countdown ticks itself
  const now = useNow(60_000);
  const lastHowToId = useAppStore((s) => s.lastHowToId);
  const eclipseEnabled = useAppStore((s) => s.eclipseEnabled);
  const destinationId = useAppStore((s) => s.destinationId);
  const offline = useOfflineReadiness();

  const [debugLine, setDebugLine] = useState("");
  useEffect(() => {
    setDebugLine(viewportDebugLine());
  }, []);

  // Trip card only when a destination with an itinerary is selected
  const today = destinationId === "iceland-2026" ? tripDayFor(localISODate(new Date(now))) : null;

  return (
    <div className="screen">
      <header className="screen-header">
        <div>
          <div className="display" style={{ fontSize: 26 }}>
            Ljósmynd
          </div>
          <div className="eyebrow">
            Nikon D7100{destinationId === "iceland-2026" ? " · Iceland '26" : ""}
          </div>
        </div>
        <IconButton icon={<Settings size={24} />} label="Settings" onClick={() => navigate("/settings")} />
      </header>

      {eclipseEnabled && (
        <Card tone="amber" glow>
          <div style={{ marginBottom: 10 }}>
            <Badge tone="amber" icon={<Eclipse size={13} />}>
              Total solar eclipse
            </Badge>
          </div>
          <LiveCountdown label="Totality · Snæfellsnes · Aug 12, 17:45:46" target={ECLIPSE_C2} tone="amber" size="md" />
          <div style={{ marginTop: 16 }}>
            <Button variant="primary" fullWidth iconLeft={<Eclipse size={18} />} onClick={() => navigate("/eclipse")}>
              Open Eclipse Mode
            </Button>
          </div>
        </Card>
      )}

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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 20 }}>
        {offline.ready ? (
          <>
            <span style={{ color: "var(--safe)", display: "flex" }}>
              <Check size={15} />
            </span>
            <span className="eyebrow" style={{ color: "var(--safe)" }}>
              Ready offline{offline.mb ? ` · ${offline.mb.toFixed(1)} MB` : ""}
            </span>
          </>
        ) : offline.checked ? (
          <>
            <span style={{ color: "var(--warn)", display: "flex" }}>
              <TriangleAlert size={15} />
            </span>
            <span className="eyebrow" style={{ color: "var(--warn)" }}>
              Connect once to finish caching
            </span>
          </>
        ) : (
          <span className="eyebrow">Checking offline cache…</span>
        )}
      </div>

      <div className="eyebrow" style={{ textAlign: "center" }}>
        build {__BUILD_ID__}
        <br />
        {debugLine}
      </div>
    </div>
  );
}
