import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TabShell } from "./TabShell";
import { HomeScreen } from "@/features/home/HomeScreen";
import { CameraScreen } from "@/features/camera3d/CameraScreen";
import { HowToScreen } from "@/features/camera3d/HowToScreen";
import { AnalyzeScreen } from "@/features/analyzer/AnalyzeScreen";
import { GuidesScreen } from "@/features/guides/GuidesScreen";
import { GuideDetailScreen } from "@/features/guides/GuideDetailScreen";
import { EclipseScreen } from "@/features/eclipse/EclipseScreen";
import { PracticeScreen } from "@/features/eclipse/PracticeScreen";
import { SettingsScreen } from "@/features/settings/SettingsScreen";
import { useAppStore } from "./store";

function EclipseGate({ children }: { children: React.ReactNode }) {
  const enabled = useAppStore((s) => s.eclipseEnabled);
  return enabled ? <>{children}</> : <Navigate to="/" replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<TabShell />}>
          <Route index element={<HomeScreen />} />
          <Route path="camera" element={<CameraScreen />} />
          <Route path="camera/howto/:id" element={<HowToScreen />} />
          <Route path="analyze" element={<AnalyzeScreen />} />
          <Route path="guides" element={<GuidesScreen />} />
          <Route path="guides/:id" element={<GuideDetailScreen />} />
          <Route
            path="eclipse"
            element={
              <EclipseGate>
                <EclipseScreen />
              </EclipseGate>
            }
          />
          <Route
            path="eclipse/practice"
            element={
              <EclipseGate>
                <PracticeScreen />
              </EclipseGate>
            }
          />
          <Route path="settings" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
