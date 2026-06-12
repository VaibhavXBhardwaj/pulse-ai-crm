import { NextRequest, NextResponse } from "next/server";
import { groqClient, MODELS } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const { brief, segmentDescription, audienceSize } = await req.json();
    if (!brief || !segmentDescription) {
      return NextResponse.json({ error: "brief and segmentDescription required" }, { status: 400 });
    }

    const systemPrompt = `You are a direct-response copywriter for a retail/D2C brand. 
Write 3 short message variants for a marketing campaign targeting the given customer segment.

Rules:
- Each variant has a different tone: "urgent", "friendly", "value"
- Keep SMS/WhatsApp under 160 chars
- Email subject lines under 60 chars
- Messages must feel personal and specific, not generic
- Use ₹ for currency, not $
- Do NOT use placeholders like [Name] — write as if speaking to the group
- Brand voice: warm, direct, no corporate speak

Respond ONLY with raw JSON — no markdown, no code fences, no explanation.

Schema:
{
  "suggestedChannel": "email" | "sms" | "whatsapp",
  "variants": [
    {
      "channel": "email" | "sms" | "whatsapp",
      "tone": "urgent" | "friendly" | "value",
      "subject": "string (email only)",
      "body": "string"
    }
  ]
}`;

    const userPrompt = `Campaign brief: ${brief}
Audience: ${segmentDescription} (${audienceSize} customers)

Write 3 variants. Suggest the best channel for this segment.`;

    const completion = await groqClient.chat.completions.create({
      model: MODELS.SMART,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";

    let parsed: { suggestedChannel: string; variants: unknown[] };
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON", raw }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[/api/ai/compose]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}