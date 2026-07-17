/** "Enhance with AI" — optional, online-only, opt-in per capture (PRD §7).
 *  Sends a ≤1024px JPEG to /api/analyze (Vercel serverless → Anthropic vision).
 *  Failures always degrade to the local result with a quiet notice. */

export interface AiEnhancement {
  sceneDescription: string;
  subject: string;
  composition: string[];
  refinement: string;
  pitfalls: string[];
}

const MAX_SIDE = 1024;
const TIMEOUT_MS = 15_000;

async function downscaleToJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", 0.8),
  );
}

export async function enhanceWithAI(
  file: File,
  context: { intent: string; lensName: string; localSummary: string },
): Promise<AiEnhancement> {
  const jpeg = await downscaleToJpeg(file);
  const form = new FormData();
  form.set("image", jpeg, "capture.jpg");
  form.set("context", JSON.stringify(context));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("/api/analyze", { method: "POST", body: form, signal: controller.signal });
    if (!res.ok) throw new Error(`AI enhance unavailable (${res.status})`);
    return (await res.json()) as AiEnhancement;
  } finally {
    clearTimeout(timer);
  }
}
