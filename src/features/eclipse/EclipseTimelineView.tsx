import { Camera, ShieldAlert, Sun } from "lucide-react";
import { Badge, Card, Countdown, RecipeTable, SafetyBanner } from "@/components/ds";
import { formatCountdown, formatDuration } from "@/lib/time";
import {
  PHASE_RECIPES,
  SUN_ALTITUDE_DEG,
  phaseAt,
  type EclipseSpot,
  type PhaseState,
} from "./timeline";

function eventClock(time: Date, practice: boolean, startMs: number): string {
  if (practice) {
    const s = Math.max(0, Math.round((time.getTime() - startMs) / 1000));
    return `+${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }
  const h = String(time.getUTCHours()).padStart(2, "0");
  const m = String(time.getUTCMinutes()).padStart(2, "0");
  const sec = time.getUTCSeconds();
  return sec ? `${h}:${m}:${String(sec).padStart(2, "0")}` : `${h}:${m}`;
}

export function EclipseTimelineView({
  spot,
  nowMs,
  practice = false,
  practiceStartMs = 0,
}: {
  spot: EclipseSpot;
  nowMs: number;
  practice?: boolean;
  practiceStartMs?: number;
}) {
  const phase: PhaseState = phaseAt(spot, nowMs);
  const countdownMs = phase.countdownTo ? phase.countdownTo.getTime() - nowMs : 0;
  const inTotality = phase.id === "totality";

  return (
    <>
      <SafetyBanner
        state={phase.safety.state}
        title={phase.safety.title}
        detail={phase.safety.detail}
        icon={phase.safety.state === "safe" ? <Sun size={26} /> : <ShieldAlert size={26} />}
      />

      <Card tone="amber" glow>
        <Countdown
          label={phase.countdownLabel}
          value={phase.countdownTo ? formatCountdown(countdownMs) : "—"}
          tone={inTotality ? "amber" : countdownMs < 5 * 60_000 ? "danger" : "amber"}
          size="lg"
        />
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 10,
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--text-secondary)",
            flexWrap: "wrap",
          }}
        >
          <span>
            Duration <strong style={{ color: "var(--paper)" }}>{formatDuration(spot.totalitySeconds)}</strong>
          </span>
          <span>
            Sun alt <strong style={{ color: "var(--paper)" }}>~{SUN_ALTITUDE_DEG}°</strong>
          </span>
          <span>
            Phase <strong style={{ color: "var(--paper)" }}>{phase.label}</strong>
          </span>
        </div>
      </Card>

      <Card padding="var(--space-4)">
        <span className="eyebrow">Timeline · {spot.name}</span>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 10 }}>
          {phase.events.map((ev, i) => {
            const done = nowMs >= ev.time.getTime();
            const nextIdx = phase.events.findIndex((e) => nowMs < e.time.getTime());
            const active = i === nextIdx;
            return (
              <div
                key={ev.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "9px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    flex: "0 0 auto",
                    borderRadius: "var(--radius-pill)",
                    background: active
                      ? "var(--amber-500)"
                      : done
                        ? "var(--safe)"
                        : "var(--border-strong)",
                    boxShadow: active ? "var(--glow-amber)" : "none",
                  }}
                />
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: active ? 700 : 500,
                    color: active ? "var(--amber-400)" : done ? "var(--text-tertiary)" : "var(--paper)",
                  }}
                >
                  {ev.label}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)" }}>
                  {eventClock(ev.time, practice, practiceStartMs)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {PHASE_RECIPES.map((r) => {
        const activeNow = r.phases.includes(phase.id);
        return (
          <div key={r.id} style={{ opacity: activeNow || phase.id === "pre" || phase.id === "post" ? 1 : 0.55 }}>
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}
            >
              <span className="display" style={{ fontSize: 18, fontWeight: 600 }}>
                {r.title}
              </span>
              <Badge tone={r.accent === "teal" ? "teal" : "amber"} icon={<Camera size={13} />}>
                {r.lensNote}
              </Badge>
            </div>
            <RecipeTable accent={r.accent} rows={r.rows} />
            <p style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.5, color: "var(--text-secondary)" }}>
              {r.note}
            </p>
          </div>
        );
      })}
    </>
  );
}
