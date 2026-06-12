"use client";

import { useState } from "react";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CampaignGenerator() {
  const [campaignName, setCampaignName] = useState("");
  const [audience, setAudience] = useState("VIP Customers");
  const [goal, setGoal] = useState("Increase Sales");

  const [result, setResult] = useState<any>(null);

  async function generateCampaign() {
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        campaignName,
        audience,
        goal,
      }),
    });

    const data = await res.json();

    setResult(data);
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Campaign Name"
        value={campaignName}
        onChange={(e) => setCampaignName(e.target.value)}
      />

      <select
        className="w-full border rounded-lg p-2"
        value={audience}
        onChange={(e) => setAudience(e.target.value)}
      >
        <option>All Customers</option>
        <option>VIP Customers</option>
        <option>Active Customers</option>
        <option>At Risk Customers</option>
        <option>Churned Customers</option>
      </select>

      <select
        className="w-full border rounded-lg p-2"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      >
        <option>Increase Sales</option>
        <option>Re-engage Users</option>
        <option>Promote Product</option>
      </select>

      <Button onClick={generateCampaign}>
        Generate AI Campaign
      </Button>

      {result && (
        <div className="border rounded-xl p-4 space-y-3">
          <h3 className="font-bold">
            {result.subject}
          </h3>

          <p className="whitespace-pre-wrap">
            {result.emailBody}
          </p>

          <Button>
            {result.cta}
          </Button>
        </div>
      )}
    </div>
  );
}