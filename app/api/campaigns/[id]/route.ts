import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        _count: { select: { communications: true, audiences: true } },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Communication stats
    const stats = await prisma.communication.groupBy({
      by: ["status"],
      where: { campaignId: id },
      _count: { status: true },
    });
    const statMap = Object.fromEntries(stats.map((s) => [s.status, s._count.status]));

    // Recent events (last 50 for the timeline)
    const recentEvents = await prisma.communicationEvent.findMany({
      where: { communication: { campaignId: id } },
      orderBy: { occurredAt: "desc" },
      take: 50,
      include: {
        communication: {
          select: { customer: { select: { name: true, email: true } } },
        },
      },
    });

    // Event counts over time (grouped by hour for chart)
    const allEvents = await prisma.communicationEvent.findMany({
      where: { communication: { campaignId: id } },
      orderBy: { occurredAt: "asc" },
      select: { eventType: true, occurredAt: true },
    });

    return NextResponse.json({
      campaign,
      stats: {
        queued: statMap.queued ?? 0,
        sent: statMap.sent ?? 0,
        delivered: statMap.delivered ?? 0,
        failed: statMap.failed ?? 0,
        opened: statMap.opened ?? 0,
        clicked: statMap.clicked ?? 0,
        total: campaign._count.communications,
      },
      recentEvents,
      allEvents,
    });
  } catch (err) {
    console.error("[/api/campaigns/[id] GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}