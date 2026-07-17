import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, RotateCcw, X } from "lucide-react";
import { Badge, Button, IconButton } from "@/components/ds";
import { useNow } from "@/lib/time";
import { useWakeLock } from "@/lib/wakelock";
import { EclipseTimelineView } from "./EclipseTimelineView";
import { practiceSpot } from "./timeline";

/** Practice mode (PRD §9.5): the full C1→C4 sequence compressed to ~5 minutes —
 *  the backyard dress rehearsal, fully offline. */
export function PracticeScreen() {
  const navigate = useNavigate();
  const [startMs, setStartMs] = useState(() => Date.now());
  const now = useNow(250);
  const spot = useMemo(() => practiceSpot(startMs), [startMs]);
  const wakeActive = useWakeLock(true);

  return (
    <div className="screen">
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="display" style={{ fontSize: 22 }}>
            Practice run
          </div>
          <Badge tone="teal">Compressed ×20</Badge>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {wakeActive && <Badge tone="safe" icon={<Lock size={13} />}>Awake</Badge>}
          <IconButton icon={<X size={22} />} label="Exit practice" onClick={() => navigate("/eclipse")} />
        </div>
      </header>

      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--text-secondary)" }}>
        Run the whole sequence with the camera in hand: U1 for partials, filter drill at the checkpoint, U2 the
        moment totality begins, bracket, and rehearse the 20-second look-up.
      </p>

      <EclipseTimelineView spot={spot} nowMs={now} practice practiceStartMs={startMs} />

      <Button variant="secondary" fullWidth iconLeft={<RotateCcw size={18} />} onClick={() => setStartMs(Date.now())}>
        Restart practice run
      </Button>
    </div>
  );
}
