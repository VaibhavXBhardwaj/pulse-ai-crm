import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── Types from channel service ─────────────────────────────────────────────────
interface ReceiptPayload {
  campaignId: string;
  events: {
    customerId: string;
    eventType: "sent" | "delivered" | "failed" | "opened" | "clicked";
    occurredAt: string;
    metadata?: Record<string, unknown>;
  }[];
}

export async function POST(req: NextRequest) {
  try {
    const body: ReceiptPayload = await req.json();
    const { campaignId, events } = body;

    if (!campaignId || !Array.isArray(events)) {
      return NextResponse.json({ error: "campaignId and events required" }, { status: 400 });
    }

    // ── Look up communication IDs for this campaign ───────────────────────────
    const communications = await prisma.communication.findMany({
      where: { campaignId },
      select: { id: true, customerId: true },
    });

    const commByCustomer = new Map(communications.map((c) => [c.customerId, c.id]));

    // ── Batch-insert events ───────────────────────────────────────────────────
    const eventData = events
      .map((e) => {
        const communicationId = commByCustomer.get(e.customerId);
        if (!communicationId) return null;
        return {
          communicationId,
          eventType: e.eventType,
          occurredAt: new Date(e.occurredAt),
          metadata: e.metadata ?? {},
        };
      })
      .filter(Boolean) as {
        communicationId: string;
        eventType: string;
        occurredAt: Date;
        metadata: object;
      }[];

    if (eventData.length > 0) {
      await prisma.communicationEvent.createMany({ data: eventData });
    }

    // ── Update communication status to the latest event type ─────────────────
    const STATUS_ORDER = ["queued", "sent", "delivered", "failed", "opened", "clicked"];

    for (const e of events) {
      const commId = commByCustomer.get(e.customerId);
      if (!commId) continue;

      const comm = await prisma.communication.findUnique({
        where: { id: commId },
        select: { status: true },
      });
      if (!comm) continue;

      const currentRank = STATUS_ORDER.indexOf(comm.status);
      const newRank = STATUS_ORDER.indexOf(e.eventType);
      if (newRank > currentRank) {
        await prisma.communication.update({
          where: { id: commId },
          data: { status: e.eventType },
        });
      }
    }

    return NextResponse.json({ received: eventData.length });
  } catch (err) {
    console.error("[/api/receipt]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}