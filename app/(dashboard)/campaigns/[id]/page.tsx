"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Mail, Smartphone, MessageSquare,
  CheckCircle2, XCircle, Eye, MousePointerClick,
  Send, Sparkles, Clock, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Stats {
  queued: number; sent: number; delivered: number;
  failed: number; opened: number; clicked: number; total: number;
}

interface CampaignDetail {
  id: string; name: string; status: string; channel: string;
  aiBrief?: string; audienceSize: number; messageTemplate: string;
  launchedAt?: string; createdAt: string;
}

interface Event {
  id: string;
  eventType: string;
  occurredAt: string;
  communication: { customer: { name: string; email: string } };
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft:     { label: "Draft",   color: "bg-gray-100 text-gray-600 border-gray-200" },
  active:    { label: "Running", color: "bg-green-50 text-green-700 border-green-200" },
  completed: { label: "Completed", color: "bg-blue-50 text-blue-700 border-blue-200" },
};

const EVENT_CONFIG: Record<string, { label: string; icon: typeof Send; color: string }> = {
  queued:    { label: "Queued",    icon: Clock,             color: "text-gray-400 bg-gray-50"   },
  sent:      { label: "Sent",      icon: Send,              color: "text-blue-500 bg-blue-50"   },
  delivered: { label: "Delivered", icon: CheckCircle2,      color: "text-green-500 bg-green-50" },
  failed:    { label: "Failed",    icon: XCircle,           color: "text-red-500 bg-red-50"     },
  opened:    { label: "Opened",    icon: Eye,               color: "text-amber-500 bg-amber-50" },
  clicked:   { label: "Clicked",   icon: MousePointerClick, color: "text-violet-500 bg-violet-50" },
};

const CHANNEL_ICONS: Record<string, typeof Mail> = {
  email: Mail, sms: Smartphone, whatsapp: MessageSquare,
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function StatCard({ label, value, subtext, icon: Icon, color }: {
  label: string; value: string | number; subtext?: string;
  icon: typeof Send; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", color.replace("text-", "bg-").replace("-500", "-100").replace("-600", "-100"))}>
          <Icon className={cn("w-4 h-4", color)} />
        </div>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{typeof value === "number" ? value.toLocaleString() : value}</div>
      {subtext && <div className="text-xs text-gray-400 mt-0.5">{subtext}</div>}
    </div>
  );
}

export default function CampaignDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/campaigns/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setCampaign(data.campaign);
        setStats(data.stats);
        setEvents(data.recentEvents ?? []);
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/40 p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50/40 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || "Campaign not found"}</p>
          <Button variant="outline" onClick={() => window.history.back()}>Go back</Button>
        </div>
      </div>
    );
  }

  const ChannelIcon = CHANNEL_ICONS[campaign.channel] ?? Mail;
  const statusCfg = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.draft;
  const deliverRate = stats && stats.sent > 0 ? Math.round((stats.delivered / stats.sent) * 100) : 0;
  const openRate = stats && stats.delivered > 0 ? Math.round((stats.opened / stats.delivered) * 100) : 0;
  const clickRate = stats && stats.opened > 0 ? Math.round((stats.clicked / stats.opened) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => (window.location.href = "/campaigns")}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to campaigns
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <ChannelIcon className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-gray-900">{campaign.name}</h1>
                  {campaign.aiBrief && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">
                      <Sparkles className="w-3 h-3" /> AI generated
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <Badge className={cn("text-xs border", statusCfg.color)}>{statusCfg.label}</Badge>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />{campaign.audienceSize.toLocaleString()} recipients
                  </span>
                  {campaign.launchedAt && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Launched {new Date(campaign.launchedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {campaign.aiBrief && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-violet-50 border border-violet-100 text-sm text-violet-700">
              <span className="font-medium">AI brief: </span>{campaign.aiBrief}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Stat cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard label="Sent" value={stats.sent} subtext="total dispatched" icon={Send} color="text-blue-500" />
            <StatCard label="Delivered" value={`${deliverRate}%`} subtext={`${stats.delivered.toLocaleString()} customers`} icon={CheckCircle2} color="text-green-500" />
            <StatCard label="Failed" value={stats.failed} subtext="delivery failures" icon={XCircle} color="text-red-500" />
            <StatCard label="Opened" value={`${openRate}%`} subtext={`${stats.opened.toLocaleString()} opens`} icon={Eye} color="text-amber-500" />
            <StatCard label="Clicked" value={`${clickRate}%`} subtext={`${stats.clicked.toLocaleString()} clicks`} icon={MousePointerClick} color="text-violet-600" />
            <StatCard label="Total audience" value={stats.total} subtext="in this campaign" icon={Users} color="text-gray-500" />
          </div>
        )}

        {/* Funnel visual */}
        {stats && stats.sent > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Delivery funnel</h3>
            <div className="space-y-2">
              {[
                { label: "Sent", value: stats.sent, color: "bg-blue-400", base: stats.total },
                { label: "Delivered", value: stats.delivered, color: "bg-green-400", base: stats.sent },
                { label: "Opened", value: stats.opened, color: "bg-amber-400", base: stats.delivered },
                { label: "Clicked", value: stats.clicked, color: "bg-violet-400", base: stats.opened },
              ].map(({ label, value, color, base }) => {
                const pct = base > 0 ? Math.round((value / base) * 100) : 0;
                return (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-gray-400 text-right">{label}</div>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full", color)}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                      />
                    </div>
                    <div className="w-24 text-xs text-gray-600 font-medium">
                      {value.toLocaleString()} <span className="text-gray-400">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Message preview */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Message sent</h3>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {campaign.messageTemplate || "No message template saved"}
          </div>
        </div>

        {/* Event feed */}
        {events.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Live activity</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {events.map((e, i) => {
                const cfg = EVENT_CONFIG[e.eventType] ?? EVENT_CONFIG.queued;
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.15 }}
                    className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", cfg.color)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {e.communication.customer.name}
                        </span>
                        <span className="text-xs text-gray-400 truncate hidden sm:inline">
                          {e.communication.customer.email}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 capitalize">{e.eventType}</div>
                    </div>
                    <div className="text-xs text-gray-400 shrink-0">{timeAgo(e.occurredAt)}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}