import { NextRequest, NextResponse } from "next/server";
import { groqClient, MODELS } from "@/lib/groq";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { brief } = await req.json();
    if (!brief?.trim()) {
      return NextResponse.json({ error: "Brief is required" }, { status: 400 });
    }

    // ── Ask Groq to turn the brief into structured filter rules ─────────────
    const systemPrompt = `You are a CRM segmentation engine. Convert a natural language audience brief into structured filter rules for a customer database.

The customer database has these fields:
- status: "active" | "at_risk" | "churned"
- totalSpend: number (lifetime spend in INR)
- orderCount: number
- lastOrderAt: ISO date string or null
- city: string or null
- tags: string array

Respond ONLY with a JSON object. No markdown, no explanation, no code fences. Just the raw JSON.

Schema:
{
  "description": "short human-readable summary of this segment",
  "filters": {
    // any subset of these keys, only include what's relevant:
    "status": "active" | "at_risk" | "churned",           // optional
    "minTotalSpend": number,                               // optional
    "maxTotalSpend": number,                               // optional
    "minOrderCount": number,                               // optional
    "daysSinceLastOrder": number,                         // optional - customers inactive for this many days
    "city": string                                        // optional
  }
}`;

    const completion = await groqClient.chat.completions.create({
      model: MODELS.SMART,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: brief },
      ],
      temperature: 0.2,
      max_tokens: 400,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";

    let parsed: { description: string; filters: Record<string, unknown> };
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON", raw }, { status: 500 });
    }

    const { filters, description } = parsed;

    // ── Build a Prisma WHERE clause from the filters ─────────────────────────
    const where: Prisma.CustomerWhereInput = {};

    if (filters.status) where.status = filters.status as string;
    if (filters.minTotalSpend || filters.maxTotalSpend) {
      where.totalSpend = {};
      if (filters.minTotalSpend) (where.totalSpend as Prisma.FloatFilter).gte = Number(filters.minTotalSpend);
      if (filters.maxTotalSpend) (where.totalSpend as Prisma.FloatFilter).lte = Number(filters.maxTotalSpend);
    }
    if (filters.minOrderCount) {
      where.orderCount = { gte: Number(filters.minOrderCount) };
    }
    if (filters.daysSinceLastOrder) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - Number(filters.daysSinceLastOrder));
      where.lastOrderAt = { lte: cutoff };
    }
    if (filters.city) {
      where.city = { contains: filters.city as string, mode: "insensitive" };
    }

    // ── Count and sample ─────────────────────────────────────────────────────
    const [audienceSize, sampleCustomers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        take: 5,
        orderBy: { totalSpend: "desc" },
        select: { id: true, name: true, email: true, totalSpend: true, status: true },
      }),
    ]);

    return NextResponse.json({
      description,
      filters,
      audienceSize,
      sampleCustomers,
    });
  } catch (err) {
    console.error("[/api/ai/segment]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}