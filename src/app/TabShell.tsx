import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Camera, Eclipse, House, ScanLine } from "lucide-react";
import { TabBar } from "@/components/ds";
import { ECLIPSE_C2 } from "@/features/eclipse/timeline";
import { useNow } from "@/lib/time";
import { useAppStore } from "./store";

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
  const eclipseEnabled = useAppStore((s) => s.eclipseEnabled);

  // Eclipse tab badge: days remaining, promoted in the final 30 days (PRD §11)
  const daysToEclipse = Math.ceil((ECLIPSE_C2.getTime() - now) / 86_400_000);
  const badge = daysToEclipse > 0 && daysToEclipse <= 30 ? String(daysToEclipse) : undefined;

  // Eclipse can be turned off in Settings (post-trip / everyday use)
  const tabs = eclipseEnabled ? TABS : TABS.filter((t) => t.id !== "eclipse");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-app)",
      }}
    >
      <div className="scroll-area" style={{ flex: 1 }} key={activeTabId(location.pathname)}>
        <Outlet />
      </div>
      <div style={{ flex: "0 0 auto" }}>
        <TabBar
          activeId={activeTabId(location.pathname)}
          onChange={(id) => {
            const tab = tabs.find((t) => t.id === id);
            if (tab) navigate(tab.path);
          }}
          items={tabs.map(({ id, label, icon }) => ({
            id,
            label,
            icon,
            badge: id === "eclipse" ? badge : undefined,
          }))}
        />
      </div>
    </div>
  );
}
