import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SparkRenderer, SplatMesh } from "@sparkjsdev/spark";
import type { Hotspot } from "./hotspots";

/** SplatViewer — orbitable Gaussian splat of the D7100 with tappable hotspot
 *  markers projected onto control positions. Plain three.js + Spark (World Labs)
 *  — Spark reads the whole buffer, so it survives brotli/gzip hosting where
 *  drei's Content-Length-dependent loader failed. Works offline once cached. */
export function SplatViewer({
  src,
  hotspots,
  onSelect,
}: {
  src: string;
  hotspots: Hotspot[];
  onSelect: (h: Hotspot) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let raf = 0;
    let disposed = false;
    const w = container.clientWidth || 320;
    const h = container.clientHeight || 320;

    // DEV: fixed camera angle via URL (?az=&el=&dist=&nohot) for authoring
    const params = new URLSearchParams(window.location.search);
    const azP = params.get("az");
    const fixedCam = azP !== null;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.01, 100);
    // Default: top plate seen from behind (shooter's view) — az 180, el ~45
    camera.position.set(0, 1.85, -1.85);
    if (fixedCam) {
      const a = (+azP * Math.PI) / 180;
      const e = ((+(params.get("el") ?? "10")) * Math.PI) / 180;
      const d = +(params.get("dist") ?? "3");
      camera.position.set(d * Math.cos(e) * Math.sin(a), d * Math.sin(e), d * Math.cos(e) * Math.cos(a));
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.domElement.style.touchAction = "none";
    container.appendChild(renderer.domElement);

    const spark = new SparkRenderer({ renderer });
    scene.add(spark);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.autoRotate = false; // hold the top-plate hero view; user orbits
    controls.minDistance = 1.2;
    controls.maxDistance = 6;
    controls.target.set(0, 0, 0);

    const mesh = new SplatMesh({
      url: src,
      onLoad: () => {
        if (!disposed) setLoaded(true);
      },
    });
    mesh.quaternion.set(1, 0, 0, 0); // splat capture frames are Y-down → flip to Y-up
    scene.add(mesh);

    const world = new THREE.Vector3();
    const camDir = new THREE.Vector3();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      camera.getWorldDirection(camDir);
      const width = renderer.domElement.clientWidth;
      const height = renderer.domElement.clientHeight;
      for (let i = 0; i < hotspots.length; i++) {
        const el = markerRefs.current[i];
        if (!el) continue;
        world.set(hotspots[i].position[0], hotspots[i].position[1], hotspots[i].position[2]).applyMatrix4(mesh.matrixWorld);
        const behind = world.clone().sub(camera.position).dot(camDir) <= 0;
        world.project(camera);
        const x = (world.x * 0.5 + 0.5) * width;
        const y = (-world.y * 0.5 + 0.5) * height;
        if (behind || world.z > 1) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
        } else {
          el.style.opacity = "1";
          el.style.pointerEvents = "auto";
        }
        el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
      }
    };
    animate();

    const onResize = () => {
      const nw = container.clientWidth || w;
      const nh = container.clientHeight || h;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      mesh.dispose?.();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [src, hotspots]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        height: 320,
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "var(--surface-sunken)",
      }}
    >
      {!new URLSearchParams(window.location.search).has("nohot") && hotspots.map((hs, i) => (
        <button
          key={hs.id}
          ref={(el) => (markerRefs.current[i] = el)}
          type="button"
          aria-label={hs.label}
          onClick={() => onSelect(hs)}
          className="press-icon"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            opacity: 0,
            width: 26,
            height: 26,
            borderRadius: "var(--radius-pill)",
            border: "2px solid var(--text-on-accent)",
            background: "var(--accent)",
            boxShadow: "var(--glow-amber)",
            cursor: "pointer",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-on-accent)" }} />
        </button>
      ))}
      {!loaded && (
        <div
          className="eyebrow"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          loading your D7100…
        </div>
      )}
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
