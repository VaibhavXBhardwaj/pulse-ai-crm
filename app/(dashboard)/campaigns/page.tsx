"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Megaphone, Plus, Search, Mail, MessageSquare,
  Smartphone, TrendingUp, Clock, CheckCircle2,
  XCircle, MousePointerClick, ChevronRight, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CampaignStats {
  queued: number; sent: number; delivered: number;
  failed: number; opened: number; clicked: number;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  channel: string;
  audienceSize: number;
  messageTemplate: string;
  launchedAt?: string;
  createdAt: string;
  aiBrief?: string;
  stats: CampaignStats;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft:     { label: "Draft",     color: "bg-gray-100 text-gray-600 border-gray-200" },
  active:    { label: "Running",   color: "bg-green-50 text-green-700 border-green-200" },
  completed: { label: "Completed", color: "bg-blue-50 text-blue-700 border-blue-200" },
  paused:    { label: "Paused",    color: "bg-amber-50 text-amber-700 border-amber-200" },
};

const CHANNEL_ICONS: Record<string, typeof Mail> = {
  email:    Mail,
  sms:      Smartphone,
  whatsapp: MessageSquare,
};

const CHANNEL_COLORS: Record<string, string> = {
  email:    "bg-blue-50 text-blue-700",
  sms:      "bg-emerald-50 text-emerald-700",
  whatsapp: "bg-green-50 text-green-700",
};

function StatBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="font-medium text-gray-700">{value.toLocaleString()} <span className="text-gray-400">({pct}%)</span></span>
      </div>
      <div className="h-1 rounded-full bg-gray-100">
        <div className={cn("h-1 rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (statusFilter !== "all") params.set("status", statusFilter);
    const res = await fetch(`/api/campaigns?${params}`);
    const data = await res.json();
    setCampaigns(data.campaigns ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const filtered = campaigns.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Summary stats across all campaigns
  const totalSent = campaigns.reduce((s, c) => s + c.stats.sent, 0);
  const totalDelivered = campaigns.reduce((s, c) => s + c.stats.delivered, 0);
  const totalOpened = campaigns.reduce((s, c) => s + c.stats.opened, 0);
  const avgOpenRate = totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0;

  const FILTER_TABS = [
    { key: "all", label: "All campaigns" },
    { key: "active", label: "Running" },
    { key: "draft", label: "Draft" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Campaigns</h1>
              <p className="text-sm text-gray-500 mt-0.5">{total} campaigns total</p>
            </div>
            <Button
  onClick={() => (window.location.href = "/studio")}
  className="text-sm gap-2"
  style={{ backgroundColor: "#7c3aed", color: "#ffffff" }}
>
  <Sparkles className="w-4 h-4" />
  New campaign
</Button>
          </div>

          {/* Summary stat cards */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "Total campaigns", value: total, icon: Megaphone, color: "text-violet-600" },
              { label: "Messages sent", value: totalSent.toLocaleString(), icon: TrendingUp, color: "text-blue-600" },
              { label: "Delivered", value: totalDelivered.toLocaleString(), icon: CheckCircle2, color: "text-green-600" },
              { label: "Avg open rate", value: `${avgOpenRate}%`, icon: MousePointerClick, color: "text-amber-600" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn("w-4 h-4", color)} />
                  <span className="text-xs text-gray-400">{label}</span>
                </div>
                <div className="text-xl font-bold text-gray-900">{value}</div>
              </div>
            ))}
          </div>

          {/* Search + status tabs */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search campaigns…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 border-gray-200 text-sm"
              />
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              {FILTER_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    statusFilter === key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Campaign list */}
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <Megaphone className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No campaigns yet</p>
            <p className="text-gray-400 text-xs mt-1">Create your first campaign in AI Studio</p>
            <Button
  onClick={() => (window.location.href = "/studio")}
  className="text-sm gap-2"
  style={{ backgroundColor: "#7c3aed", color: "#ffffff" }}
>
  <Sparkles className="w-4 h-4" />
  New campaign
</Button>
          </div>
        ) : (
          filtered.map((c, i) => {
            const ChannelIcon = CHANNEL_ICONS[c.channel] ?? Mail;
            const statusCfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.draft;
            const sentTotal = c.stats.sent + c.stats.delivered + c.stats.opened + c.stats.clicked;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:border-violet-200 transition-all group"
                onClick={() => (window.location.href = `/campaigns/${c.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", CHANNEL_COLORS[c.channel])}>
                      <ChannelIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 text-sm">{c.name}</h3>
                        {c.aiBrief && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600 font-medium">
                            <Sparkles className="w-2.5 h-2.5" />AI
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={cn("text-xs border", statusCfg.color)}>{statusCfg.label}</Badge>
                        <span className="text-xs text-gray-400">
                          {c.audienceSize.toLocaleString()} recipients
                        </span>
                        {c.launchedAt && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(c.launchedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-violet-500 transition-colors mt-1 shrink-0" />
                </div>

                {/* Delivery stats */}
                {sentTotal > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    <StatBar label="Delivered" value={c.stats.delivered} total={c.audienceSize} color="bg-green-400" />
                    <StatBar label="Opened" value={c.stats.opened} total={c.stats.delivered || c.audienceSize} color="bg-blue-400" />
                    <StatBar label="Clicked" value={c.stats.clicked} total={c.stats.opened || c.audienceSize} color="bg-violet-400" />
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" />No delivery data yet</span>
                    {c.messageTemplate && (
                      <span className="text-gray-300 truncate max-w-xs">{c.messageTemplate.slice(0, 80)}…</span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}