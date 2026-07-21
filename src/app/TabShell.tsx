import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Camera, Eclipse, House, ScanLine } from "lucide-react";
import { TabBar } from "@/components/ds";
import { ECLIPSE_C2 } from "@/features/eclipse/timeline";
import { useNow } from "@/lib/time";

const TABS = [
  { id: "home", path: "/", label: "Home", icon: <House size={24} /> },
  { id: "camera", path: "/camera", label: "Camera", icon: <Camera size={24} /> },
  { id: "analyze", path: "/analyze", label: "Analyze", icon: <ScanLine size={24} /> },
  { id: "guides", path: "/guides", label: "Guides", icon: <BookOpen size={24} /> },
  { id: "eclipse", path: "/eclipse", label: "Eclipse", icon: <Eclipse size={24} /> },
];

function activeTabId(pathname: string): string {
  if (pathname.startsWith("/camera")) return "camera";
  if (pathname.startsWith("/analyze")) return "analyze";
  if (pathname.startsWith("/guides")) return "guides";
  if (pathname.startsWith("/eclipse")) return "eclipse";
  return "home";
}

export function TabShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const now = useNow(60_000);

  // Eclipse tab badge: days remaining, promoted in the final 30 days (PRD §11)
  const daysToEclipse = Math.ceil((ECLIPSE_C2.getTime() - now) / 86_400_000);
  const badge = daysToEclipse > 0 && daysToEclipse <= 30 ? String(daysToEclipse) : undefined;

  // DEBUG (temporary): magenta bar pinned to the BOTTOM of the web viewport.
  // If it sits at the physical screen bottom, web content reaches the bottom
  // (any gap is my bug). If there's black BELOW the magenta bar, that black is
  // iOS's reserved strip — unreachable by any web code. Lime marks viewport top.
  const debug = true;
  return (
    <>
      {debug && (
        <>
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 5, background: "lime", zIndex: 99999 }} />
          <div
            style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 5, background: "magenta", zIndex: 99999 }}
          />
        </>
      )}
    <div
      style={{
        position: "fixed",
        inset: 0,
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-app)",
        outline: debug ? "3px solid red" : undefined,
        outlineOffset: debug ? "-3px" : undefined,
      }}
    >
      <div className="scroll-area" style={{ flex: 1 }} key={activeTabId(location.pathname)}>
        <Outlet />
      </div>
      <div style={{ flex: "0 0 auto", outline: debug ? "3px solid cyan" : undefined, outlineOffset: debug ? "-3px" : undefined }}>
        <TabBar
          activeId={activeTabId(location.pathname)}
          onChange={(id) => {
            const tab = TABS.find((t) => t.id === id);
            if (tab) navigate(tab.path);
          }}
          items={TABS.map(({ id, label, icon }) => ({
            id,
            label,
            icon,
            badge: id === "eclipse" ? badge : undefined,
          }))}
        />
      </div>
    </div>
    </>
  );
}
