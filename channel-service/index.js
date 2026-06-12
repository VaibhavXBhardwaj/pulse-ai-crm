/**
 * PulseAI Channel Service
 * ─────────────────────────────────────────────────────────────
 * Separate Node.js service (port 3001) that simulates the full
 * communication delivery lifecycle:
 *   queued → sent → delivered/failed → opened → clicked
 *
 * Usage:
 *   cd channel-service
 *   npm install
 *   node index.js
 * ─────────────────────────────────────────────────────────────
 */

const express = require("express");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ── Simulation config ─────────────────────────────────────────────────────────
const SIM = {
  SENT_DELAY_MS: 500,          // time before "sent" events fire
  DELIVER_DELAY_MS: 2000,      // time before delivered/failed
  OPEN_DELAY_MS: 5000,         // time before some open events
  CLICK_DELAY_MS: 8000,        // time before some click events

  DELIVERY_RATE: 0.92,         // 92% of messages get delivered
  OPEN_RATE: 0.65,             // 65% of delivered messages get opened
  CLICK_RATE: 0.30,            // 30% of opened messages get clicked
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomBool(probability) {
  return Math.random() < probability;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fireCallback(callbackUrl, payload) {
  try {
    const res = await fetch(callbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`[callback] ${callbackUrl} returned ${res.status}`);
    } else {
      console.log(`[callback] fired ${payload.events.length} events to ${callbackUrl}`);
    }
  } catch (err) {
    console.error(`[callback] failed to reach ${callbackUrl}:`, err.message);
  }
}

// ── Main simulation runner ────────────────────────────────────────────────────

async function simulateCampaign({ campaignId, recipients, callbackUrl, channel }) {
  console.log(`[sim] Starting campaign ${campaignId} — ${recipients.length} recipients via ${channel}`);

  // Step 1: sent (fast)
  await sleep(SIM.SENT_DELAY_MS);
  await fireCallback(callbackUrl, {
    campaignId,
    events: recipients.map((r) => ({
      customerId: r.customerId,
      eventType: "sent",
      occurredAt: new Date().toISOString(),
    })),
  });

  // Step 2: delivered / failed (staggered)
  await sleep(SIM.DELIVER_DELAY_MS);
  const deliveredIds = [];
  const failedIds = [];
  for (const r of recipients) {
    if (randomBool(SIM.DELIVERY_RATE)) {
      deliveredIds.push(r.customerId);
    } else {
      failedIds.push(r.customerId);
    }
  }

  const deliverEvents = [
    ...deliveredIds.map((customerId) => ({
      customerId,
      eventType: "delivered",
      occurredAt: new Date().toISOString(),
    })),
    ...failedIds.map((customerId) => ({
      customerId,
      eventType: "failed",
      occurredAt: new Date().toISOString(),
      metadata: { reason: "simulated_failure" },
    })),
  ];
  await fireCallback(callbackUrl, { campaignId, events: deliverEvents });

  // Step 3: opens (subset of delivered)
  await sleep(SIM.OPEN_DELAY_MS);
  const openedIds = deliveredIds.filter(() => randomBool(SIM.OPEN_RATE));
  if (openedIds.length > 0) {
    await fireCallback(callbackUrl, {
      campaignId,
      events: openedIds.map((customerId) => ({
        customerId,
        eventType: "opened",
        occurredAt: new Date().toISOString(),
      })),
    });
  }

  // Step 4: clicks (subset of opens)
  await sleep(SIM.CLICK_DELAY_MS);
  const clickedIds = openedIds.filter(() => randomBool(SIM.CLICK_RATE));
  if (clickedIds.length > 0) {
    await fireCallback(callbackUrl, {
      campaignId,
      events: clickedIds.map((customerId) => ({
        customerId,
        eventType: "clicked",
        occurredAt: new Date().toISOString(),
        metadata: { url: "https://pulseai.example.com/offer" },
      })),
    });
  }

  console.log(
    `[sim] Done — delivered:${deliveredIds.length} failed:${failedIds.length} ` +
    `opened:${openedIds.length} clicked:${clickedIds.length}`
  );
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "pulse-channel-service", ts: new Date().toISOString() });
});

app.post("/send", async (req, res) => {
  const { campaignId, recipients, callbackUrl, channel } = req.body;

  if (!campaignId || !Array.isArray(recipients) || !callbackUrl) {
    return res.status(400).json({ error: "campaignId, recipients[], callbackUrl required" });
  }

  // Acknowledge immediately — simulation runs async
  res.json({ accepted: recipients.length, campaignId });

  // Run simulation in background (don't await)
  simulateCampaign({ campaignId, recipients, callbackUrl, channel }).catch((err) =>
    console.error("[sim] Unhandled error:", err)
  );
});

app.listen(PORT, () => {
  console.log(`✅ Channel service running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Send:   POST http://localhost:${PORT}/send`);
});