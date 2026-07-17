import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "@/lib/storage";
import type { RecipeRow } from "@/components/ds";

export type IntentId =
  | "landscape"
  | "portrait"
  | "action"
  | "waterfall"
  | "lowlight"
  | "auto";

export interface Preset {
  id: string;
  name: string;
  createdAt: string;
  /** where it came from: guide id, "analyzer", or "eclipse" */
  source: string;
  lensId?: string;
  rows: RecipeRow[];
  note?: string;
}

export interface AnalysisHistoryEntry {
  id: string;
  at: string;
  thumb?: string; // small data-URL
  summary: string; // "EV 14.2 · overcast"
}

interface AppState {
  mountedLensId: string;
  intent: IntentId;
  eclipseSpotId: string;
  checklist: Record<string, boolean>;
  lastHowToId: string | null;
  presets: Preset[];
  history: AnalysisHistoryEntry[];
  setMountedLens: (id: string) => void;
  setIntent: (i: IntentId) => void;
  setEclipseSpot: (id: string) => void;
  toggleChecklist: (id: string) => void;
  setLastHowTo: (id: string) => void;
  addPreset: (p: Preset) => void;
  removePreset: (id: string) => void;
  updatePresetNote: (id: string, note: string) => void;
  addHistory: (e: AnalysisHistoryEntry) => void;
  importState: (data: Pick<AppState, "presets" | "checklist">) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      mountedLensId: "nikkor-35-18g",
      intent: "landscape",
      eclipseSpotId: "hellissandur",
      checklist: {},
      lastHowToId: null,
      presets: [],
      history: [],
      setMountedLens: (id) => set({ mountedLensId: id }),
      setIntent: (intent) => set({ intent }),
      setEclipseSpot: (id) => set({ eclipseSpotId: id }),
      toggleChecklist: (id) =>
        set((s) => ({ checklist: { ...s.checklist, [id]: !s.checklist[id] } })),
      setLastHowTo: (id) => set({ lastHowToId: id }),
      addPreset: (p) => set((s) => ({ presets: [p, ...s.presets] })),
      removePreset: (id) => set((s) => ({ presets: s.presets.filter((p) => p.id !== id) })),
      updatePresetNote: (id, note) =>
        set((s) => ({ presets: s.presets.map((p) => (p.id === id ? { ...p, note } : p)) })),
      addHistory: (e) => set((s) => ({ history: [e, ...s.history].slice(0, 20) })),
      importState: (data) => set({ presets: data.presets, checklist: data.checklist }),
    }),
    {
      name: "ljosmynd",
      storage: createJSONStorage(() => idbStorage),
    },
  ),
);
