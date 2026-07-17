/** Eclipse prep checklist (PRD §9.4) — armed on Home from Aug 1. */
export interface ChecklistDef {
  id: string;
  label: string;
  detail?: string;
  urgent?: boolean;
}

export const ECLIPSE_CHECKLIST: ChecklistDef[] = [
  { id: "solar-filter", label: "52mm solar filter", detail: "Buy before departure", urgent: true },
  { id: "eclipse-glasses", label: "ISO 12312-2 eclipse glasses" },
  { id: "tripod", label: "Tripod packed" },
  { id: "batteries", label: "EN-EL15 spares charged", detail: "Cold drains batteries" },
  { id: "cards", label: "SD cards empty · both slots" },
  { id: "u1u2", label: "U1/U2 banks saved", detail: "U1 partials · U2 totality" },
  { id: "focus", label: "Manual focus rehearsed" },
  { id: "layers", label: "Layers & thin gloves" },
];
