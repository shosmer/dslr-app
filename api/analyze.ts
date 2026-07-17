/** Vercel serverless: Claude vision proxy for "Enhance with AI" (PRD §7, §13).
 *  ANTHROPIC_API_KEY lives in Vercel env only — never in the client. Without it
 *  the endpoint answers 501 and the PWA quietly stays local-only. */

export const config = { maxDuration: 30 };

const MAX_BYTES = 1_500_000; // ~1MB downscaled JPEG, small margin

interface AiEnhancement {
  sceneDescription: string;
  subject: string;
  composition: string[];
  refinement: string;
  pitfalls: string[];
}

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: "AI enhancement not configured" }, 501);
  }

  let imageB64: string;
  let mediaType = "image/jpeg";
  let context: { intent?: string; lensName?: string; localSummary?: string } = {};
  try {
    const form = await req.formData();
    const image = form.get("image");
    if (!(image instanceof Blob)) return json({ error: "image required" }, 400);
    if (image.size > MAX_BYTES) return json({ error: "image too large" }, 413);
    mediaType = image.type || "image/jpeg";
    const buf = Buffer.from(await image.arrayBuffer());
    imageB64 = buf.toString("base64");
    const rawContext = form.get("context");
    if (typeof rawContext === "string") context = JSON.parse(rawContext);
  } catch {
    return json({ error: "bad request" }, 400);
  }

  const prompt = `You are the AI layer of Ljósmynd, a field companion app for a Nikon D7100 (DX, ISO 100-6400, lenses: 35mm f/1.8G and 55-200mm f/4-5.6G).
The photographer is shooting ${context.intent ?? "unknown intent"} with the ${context.lensName ?? "unknown lens"}.
The on-device engine already recommends: ${context.localSummary ?? "n/a"}.

Look at the photo of the scene and return STRICT JSON (no markdown) with keys:
- sceneDescription: one sentence, what the light is actually doing
- subject: the main subject you can identify
- composition: 1-2 short suggestions
- refinement: one sentence adjusting or confirming the local recommendation, with reasoning
- pitfalls: 1-2 pitfalls specific to what's actually in frame

Voice: direct, confident, zero fluff, second person. Never contradict eye-safety guidance.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageB64 } },
            { type: "text", text: prompt },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    return json({ error: "upstream failure" }, 502);
  }
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((c) => c.type === "text")?.text ?? "";
  try {
    const parsed = JSON.parse(text.replace(/^```(json)?|```$/g, "").trim()) as AiEnhancement;
    return json(parsed, 200);
  } catch {
    return json({ error: "unparseable model output" }, 502);
  }
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
