import { useNavigate } from "react-router-dom";
import { CloudSun, Lock, LockOpen, Play, TriangleAlert } from "lucide-react";
import { Badge, Button, Card, ChecklistItem, SegmentedControl } from "@/components/ds";
import { useAppStore } from "@/app/store";
import { useNow } from "@/lib/time";
import { useWakeLock, wakeLockSupported } from "@/lib/wakelock";
import { ECLIPSE_CHECKLIST } from "./checklist";
import { EclipseTimelineView } from "./EclipseTimelineView";
import { SPOTS, spotById, phaseAt } from "./timeline";

export function EclipseScreen() {
  const navigate = useNavigate();
  const now = useNow(1000);
  const spotId = useAppStore((s) => s.eclipseSpotId);
  const setSpot = useAppStore((s) => s.setEclipseSpot);
  const checklist = useAppStore((s) => s.checklist);
  const toggleChecklist = useAppStore((s) => s.toggleChecklist);

  const spot = spotById(spotId);
  const phase = phaseAt(spot, now);
  // Hold the screen awake through the live sequence (C1 → C4)
  const sequenceLive = phase.id !== "pre" && phase.id !== "post";
  const wakeActive = useWakeLock(sequenceLive);

  return (
    <div className="screen">
      <header className="screen-header">
        <div className="display" style={{ fontSize: 24 }}>
          Eclipse Mode
        </div>
        {sequenceLive ? (
          wakeActive ? (
            <Badge tone="safe" icon={<Lock size={13} />}>
              Wake-lock on
            </Badge>
          ) : (
            <Badge tone="warn" icon={<LockOpen size={13} />}>
              {wakeLockSupported ? "Wake-lock pending" : "Keep screen awake yourself"}
            </Badge>
          )
        ) : (
          <Badge tone="amber">Aug 12 · 2026</Badge>
        )}
      </header>

      <SegmentedControl
        value={spot.id}
        onChange={setSpot}
        options={SPOTS.slice(0, 3).map((s) => ({ value: s.id, label: s.name }))}
      />
      <SegmentedControl
        value={spot.id}
        onChange={setSpot}
        options={SPOTS.slice(3).map((s) => ({ value: s.id, label: s.name }))}
      />

      {!spot.verified && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            background: "var(--warn-tint)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <span style={{ color: "var(--warn)", flex: "0 0 auto" }}>
            <TriangleAlert size={18} />
          </span>
          <span style={{ fontSize: 13, color: "var(--paper-dim)" }}>
            Contact times for {spot.name} are estimates — verify on the Day-11 scouting trip.
          </span>
        </div>
      )}

      <EclipseTimelineView spot={spot} nowMs={now} />

      <Button
        variant="primary"
        size="lg"
        fullWidth
        iconLeft={<Play size={20} />}
        onClick={() => navigate("/eclipse/practice")}
      >
        Run practice mode (5 min)
      </Button>

      <Card tone="sunken" padding="var(--space-4)">
        <span className="eyebrow" style={{ display: "block", marginBottom: 4 }}>
          Prep checklist · {ECLIPSE_CHECKLIST.filter((c) => checklist[c.id]).length} of {ECLIPSE_CHECKLIST.length}
        </span>
        {ECLIPSE_CHECKLIST.map((c) => (
          <ChecklistItem
            key={c.id}
            label={c.label}
            detail={c.detail}
            urgent={c.urgent}
            checked={!!checklist[c.id]}
            onToggle={() => toggleChecklist(c.id)}
          />
        ))}
      </Card>

      <Card padding="var(--space-4)">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ color: "var(--teal-400)" }}>
            <CloudSun size={20} />
          </span>
          <span className="display" style={{ fontSize: 16, fontWeight: 600 }}>
            If it's overcast
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)" }}>
          Shoot the eerie darkness itself: 35mm, f/1.8–2.8, ISO 800–1600, 1/60s. The light will fall like a
          dimmer switch over two minutes. Then put the camera down and experience it — clouds don't cancel the
          chill, the silence, or the 360° sunset.
        </p>
      </Card>

      <div className="eyebrow" style={{ textAlign: "center" }}>
        Eye safety is never hedged: no unfiltered looking outside totality.
      </div>
    </div>
  );
}
