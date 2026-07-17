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
import { PresetsScreen } from "@/features/presets/PresetsScreen";

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
          <Route path="eclipse" element={<EclipseScreen />} />
          <Route path="eclipse/practice" element={<PracticeScreen />} />
          <Route path="presets" element={<PresetsScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
