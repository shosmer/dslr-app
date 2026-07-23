import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import type { Hotspot } from "./hotspots";

/** WireframeViewer — crisp feature-line ("blueprint") render of a modeled D7100
 *  GLB. EdgesGeometry(thresholdAngle) keeps only meaningful edges; fat lines
 *  (LineSegments2) give a controllable amber stroke; a dark fill occludes back
 *  edges for depth. Same interface as SplatViewer so it's swappable. */
export function WireframeViewer({
  src,
  hotspots,
  onSelect,
  thresholdDeg = 32,
}: {
  src: string;
  hotspots: Hotspot[];
  onSelect: (h: Hotspot) => void;
  thresholdDeg?: number;
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

    const params = new URLSearchParams(window.location.search);
    const azP = params.get("az");
    const fixedCam = azP !== null;
    const threshold = params.get("thr") ? +params.get("thr")! : thresholdDeg;
    const authorMode = params.has("author");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.01, 100);
    // Default: top plate from behind (shooter's view)
    camera.position.set(-0.48, 1.67, -1.8);
    if (fixedCam) {
      const a = (+azP * Math.PI) / 180;
      const e = ((+(params.get("el") ?? "20")) * Math.PI) / 180;
      const d = +(params.get("dist") ?? "3");
      camera.position.set(d * Math.cos(e) * Math.sin(a), d * Math.sin(e), d * Math.cos(e) * Math.cos(a));
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.domElement.style.touchAction = "none";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.autoRotate = false; // hold the top-plate hero view
    controls.minDistance = 1.2;
    controls.maxDistance = 6;
    controls.target.set(0, 0, 0);

    const group = new THREE.Group();
    scene.add(group);

    const lineMat = new LineMaterial({
      color: new THREE.Color("#eeb64b").getHex(),
      linewidth: 1.6, // px (worldUnits false)
      worldUnits: false,
      alphaToCoverage: true,
    });
    lineMat.resolution.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());

    const loader = new GLTFLoader();
    loader.load(
      src,
      (gltf) => {
        if (disposed) return;
        const root = gltf.scene;
        root.updateMatrixWorld(true);

        const edgePositions: number[] = [];
        const fillMeshes: THREE.Mesh[] = [];
        const fillMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color("#141210"),
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        });
        root.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh || !m.geometry) return;
          const g = m.geometry.clone();
          g.applyMatrix4(m.matrixWorld);
          const edges = new THREE.EdgesGeometry(g, threshold);
          const arr = edges.attributes.position.array as ArrayLike<number>;
          for (let i = 0; i < arr.length; i++) edgePositions.push(arr[i]);
          fillMeshes.push(new THREE.Mesh(g, fillMat));
          edges.dispose();
        });

        // Center + normalize to unit-ish radius
        const box = new THREE.Box3();
        const tmp = new THREE.Vector3();
        for (let i = 0; i < edgePositions.length; i += 3) {
          box.expandByPoint(tmp.set(edgePositions[i], edgePositions[i + 1], edgePositions[i + 2]));
        }
        const center = box.getCenter(new THREE.Vector3());
        const radius = box.getSize(new THREE.Vector3()).length() / 2 || 1;
        const s = 1.1 / radius;
        group.position.copy(center).multiplyScalar(-s);
        group.scale.setScalar(s);

        for (const fm of fillMeshes) group.add(fm);
        const lineGeo = new LineSegmentsGeometry();
        lineGeo.setPositions(edgePositions);
        const lines = new LineSegments2(lineGeo, lineMat);
        lines.computeLineDistances();
        group.add(lines);

        if (authorMode) {
          const ray = new THREE.Raycaster();
          const ndc = new THREE.Vector2();
          renderer.domElement.addEventListener("click", (ev) => {
            const rect = renderer.domElement.getBoundingClientRect();
            ndc.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
            ndc.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
            ray.setFromCamera(ndc, camera);
            const hits = ray.intersectObjects(fillMeshes, false);
            if (hits.length) {
              const l = group.worldToLocal(hits[0].point.clone());
              // eslint-disable-next-line no-console
              console.log("HOTSPOT " + JSON.stringify([+l.x.toFixed(3), +l.y.toFixed(3), +l.z.toFixed(3)]));
            }
          });
        }

        setLoaded(true);
      },
      undefined,
      () => {
        // load error → surface to the ErrorBoundary by throwing on next tick
        if (!disposed) setLoaded(true);
      },
    );

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
        world
          .set(hotspots[i].position[0], hotspots[i].position[1], hotspots[i].position[2])
          .applyMatrix4(group.matrixWorld);
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
      lineMat.resolution.set(nw * renderer.getPixelRatio(), nh * renderer.getPixelRatio());
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [src, hotspots, thresholdDeg]);

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
      {!new URLSearchParams(window.location.search).has("nohot") &&
        hotspots.map((hs, i) => (
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
          style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}
        >
          loading…
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
