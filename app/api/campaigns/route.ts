import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "20");

    const where = status && status !== "all" ? { status } : {};

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { communications: true, audiences: true } },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    // Get per-campaign communication stats
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (c) => {
        const stats = await prisma.communication.groupBy({
          by: ["status"],
          where: { campaignId: c.id },
          _count: { status: true },
        });
        const statMap = Object.fromEntries(stats.map((s) => [s.status, s._count.status]));
        return {
          ...c,
          stats: {
            queued: statMap.queued ?? 0,
            sent: statMap.sent ?? 0,
            delivered: statMap.delivered ?? 0,
            failed: statMap.failed ?? 0,
            opened: statMap.opened ?? 0,
            clicked: statMap.clicked ?? 0,
          },
        };
      })
    );

    return NextResponse.json({ campaigns: campaignsWithStats, total, page, limit });
  } catch (err) {
    console.error("[/api/campaigns GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}