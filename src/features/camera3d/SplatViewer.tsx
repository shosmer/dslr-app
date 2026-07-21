import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, Splat } from "@react-three/drei";
import type { Hotspot } from "./hotspots";

/** SplatViewer — orbitable Gaussian splat of the D7100 with tappable hotspot
 *  markers anchored to control positions. Backdrop is a placeholder splat until
 *  Shanny's real scan drops in (swap the src + author real hotspot positions).
 *  Renders via R3F + drei on WebGL — works offline once the .splat is precached. */

function HotspotMarker({ hotspot, onSelect }: { hotspot: Hotspot; onSelect: (h: Hotspot) => void }) {
  return (
    <Html position={hotspot.position} center style={{ pointerEvents: "auto" }}>
      <button
        type="button"
        aria-label={hotspot.label}
        onClick={() => onSelect(hotspot)}
        className="press-icon"
        style={{
          width: 26,
          height: 26,
          borderRadius: "var(--radius-pill)",
          border: "2px solid var(--text-on-accent)",
          background: "var(--accent)",
          boxShadow: "var(--glow-amber)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-on-accent)" }} />
      </button>
    </Html>
  );
}

export function SplatViewer({
  src,
  hotspots,
  onSelect,
}: {
  src: string;
  hotspots: Hotspot[];
  onSelect: (h: Hotspot) => void;
}) {
  return (
    <div
      style={{
        height: 320,
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "var(--surface-sunken)",
        position: "relative",
      }}
    >
      <Canvas camera={{ position: [0, 0.2, 4], fov: 40 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          {/* Splat coordinate frames are Y-down from most capture tools → flip */}
          <group rotation={[Math.PI, 0, 0]}>
            <Splat src={src} />
          </group>
          {hotspots.map((h) => (
            <HotspotMarker key={h.id} hotspot={h} onSelect={onSelect} />
          ))}
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={1.5}
          maxDistance={7}
          autoRotate
          autoRotateSpeed={0.6}
          makeDefault
        />
      </Canvas>
      <span
        className="eyebrow"
        style={{
          position: "absolute",
          left: 12,
          bottom: 10,
          background: "oklch(0.13 0.006 60 / 0.7)",
          padding: "4px 8px",
          borderRadius: "var(--radius-xs)",
          pointerEvents: "none",
        }}
      >
        drag to orbit · tap a marker
      </span>
    </div>
  );
}
