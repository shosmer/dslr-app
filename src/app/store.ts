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

export type DestinationId = "iceland-2026" | "none";

interface AppState {
  // Gear config (Settings → Camera & lenses)
  bodyId: string;
  /** which lenses are "in the bag" — drives the Analyze picker & recommendations */
  activeLensIds: string[];
  // Trip config (Settings → Trip)
  destinationId: DestinationId;
  // Eclipse config (Settings → Eclipse)
  eclipseEnabled: boolean;
  eclipseSpotId: string;
  // Session/usage state
  mountedLensId: string;
  intent: IntentId;
  checklist: Record<string, boolean>;
  lastHowToId: string | null;
  presets: Preset[];
  history: AnalysisHistoryEntry[];
  // setters
  setActiveLenses: (ids: string[]) => void;
  toggleLens: (id: string) => void;
  setDestination: (id: DestinationId) => void;
  setEclipseEnabled: (on: boolean) => void;
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

const ALL_LENS_IDS = ["nikkor-35-18g", "nikkor-55-200-g-ed", "lens-mid-tbd"];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      bodyId: "nikon-d7100",
      activeLensIds: [...ALL_LENS_IDS],
      destinationId: "iceland-2026",
      eclipseEnabled: true,
      eclipseSpotId: "hellissandur",
      mountedLensId: "nikkor-35-18g",
      intent: "landscape",
      checklist: {},
      lastHowToId: null,
      presets: [],
      history: [],
      setActiveLenses: (ids) => set({ activeLensIds: ids }),
      toggleLens: (id) =>
        set((s) => {
          const has = s.activeLensIds.includes(id);
          // never allow zero lenses
          if (has && s.activeLensIds.length === 1) return s;
          const activeLensIds = has
            ? s.activeLensIds.filter((l) => l !== id)
            : [...s.activeLensIds, id];
          // keep the mounted lens valid
          const mountedLensId = activeLensIds.includes(s.mountedLensId)
            ? s.mountedLensId
            : activeLensIds[0];
          return { activeLensIds, mountedLensId };
        }),
      setDestination: (destinationId) => set({ destinationId }),
      setEclipseEnabled: (eclipseEnabled) => set({ eclipseEnabled }),
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
