import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const CHANNEL_SERVICE_URL = process.env.CHANNEL_SERVICE_URL ?? "http://localhost:3001";

export async function POST(req: NextRequest) {
  try {
    const { brief, segmentFilters, audienceSize, channel, message, subject } = await req.json();

    if (!brief || !channel || !message) {
      return NextResponse.json({ error: "brief, channel, message required" }, { status: 400 });
    }

    // ── Re-query matching customers (filters from AI segment step) ────────────
    const where: Prisma.CustomerWhereInput = {};
    const f = segmentFilters ?? {};

    if (f.status) where.status = f.status;
    if (f.minTotalSpend || f.maxTotalSpend) {
      where.totalSpend = {};
      if (f.minTotalSpend) (where.totalSpend as Prisma.FloatFilter).gte = Number(f.minTotalSpend);
      if (f.maxTotalSpend) (where.totalSpend as Prisma.FloatFilter).lte = Number(f.maxTotalSpend);
    }
    if (f.minOrderCount) {
      where.orderCount = { gte: Number(f.minOrderCount) };
    }
    if (f.daysSinceLastOrder) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - Number(f.daysSinceLastOrder));
      where.lastOrderAt = { lte: cutoff };
    }
    if (f.city) {
      where.city = { contains: f.city, mode: "insensitive" };
    }

    const customers = await prisma.customer.findMany({
      where,
      select: { id: true, email: true, name: true },
      take: 500, // cap at 500 for demo
    });

    const actualSize = customers.length;

    // ── Create Campaign ───────────────────────────────────────────────────────
    const campaignName = brief.length > 60 ? brief.slice(0, 60) + "…" : brief;

    const campaign = await prisma.campaign.create({
      data: {
        name: campaignName,
        status: "active",
        channel,
        aiBrief: brief,
        segmentRules: segmentFilters ?? {},
        audienceSize: actualSize,
        messageTemplate: message,
        launchedAt: new Date(),
      },
    });

    // ── Create audience + communication records in bulk ───────────────────────
    if (customers.length > 0) {
      await prisma.campaignAudience.createMany({
        data: customers.map((c) => ({
          campaignId: campaign.id,
          customerId: c.id,
        })),
        skipDuplicates: true,
      });

      await prisma.communication.createMany({
        data: customers.map((c) => ({
          campaignId: campaign.id,
          customerId: c.id,
          channel,
          message,
          status: "queued",
        })),
      });
    }

    // ── Fire-and-forget: call channel service ─────────────────────────────────
    // We don't await this — the channel service processes async and callbacks
    const callbackBase = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    fetch(`${CHANNEL_SERVICE_URL}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId: campaign.id,
        channel,
        callbackUrl: `${callbackBase}/api/receipt`,
        recipients: customers.map((c) => ({
          customerId: c.id,
          email: c.email,
          name: c.name,
          message,
          subject: subject ?? null,
        })),
      }),
    }).catch((err) => console.error("[launch] channel service unreachable:", err));

    return NextResponse.json({
      campaignId: campaign.id,
      campaignName: campaign.name,
      audienceSize: actualSize,
      channel,
    });
  } catch (err) {
    console.error("[/api/ai/launch]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}