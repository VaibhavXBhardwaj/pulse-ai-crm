"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Users, MessageSquare, Rocket,
  ChevronRight, ChevronLeft, Check, Loader2,
  Zap, Target, Send, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SegmentResult {
  description: string;
  filters: Record<string, unknown>;
  audienceSize: number;
  sampleCustomers: { id: string; name: string; email: string; totalSpend: number; status: string }[];
}

interface MessageVariant {
  channel: "email" | "sms" | "whatsapp";
  subject?: string;
  body: string;
  tone: string;
}

interface ComposeResult {
  variants: MessageVariant[];
  suggestedChannel: "email" | "sms" | "whatsapp";
}

interface LaunchResult {
  campaignId: string;
  campaignName: string;
  audienceSize: number;
  channel: string;
}

type Step = "brief" | "segment" | "compose" | "launched";

const STEPS: { id: Step; label: string; icon: typeof Sparkles }[] = [
  { id: "brief", label: "Brief", icon: Sparkles },
  { id: "segment", label: "Audience", icon: Users },
  { id: "compose", label: "Message", icon: MessageSquare },
  { id: "launched", label: "Launch", icon: Rocket },
];

const CHANNEL_COLORS: Record<string, string> = {
  email: "bg-blue-50 text-blue-700 border-blue-200",
  sms: "bg-emerald-50 text-emerald-700 border-emerald-200",
  whatsapp: "bg-green-50 text-green-700 border-green-200",
};

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

const EXAMPLE_BRIEFS = [
  "Customers who haven't ordered in 60 days but spent over ₹5000 lifetime",
  "High-value customers from Delhi and Mumbai who bought last month",
  "Churned customers who placed at least 3 orders",
  "New customers who joined in the last 30 days",
];

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                active && "bg-violet-600 text-white shadow-sm shadow-violet-200",
                done && "bg-violet-100 text-violet-600",
                !active && !done && "text-gray-400"
              )}
            >
              {done ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Icon className="w-3.5 h-3.5" />
              )}
              <span>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-6 h-px mx-1 transition-all duration-300",
                  i < currentIdx ? "bg-violet-300" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function StudioPage() {
  const [step, setStep] = useState<Step>("brief");
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [segment, setSegment] = useState<SegmentResult | null>(null);
  const [compose, setCompose] = useState<ComposeResult | null>(null);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState<"email" | "sms" | "whatsapp">("email");
  const [launchResult, setLaunchResult] = useState<LaunchResult | null>(null);

  // ── Step 1 → 2: generate segment ──────────────────────────────────────────
  async function handleGenerateSegment() {
    if (!brief.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/segment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: SegmentResult = await res.json();
      setSegment(data);
      setStep("segment");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2 → 3: compose message ───────────────────────────────────────────
  async function handleCompose() {
    if (!segment) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, segmentDescription: segment.description, audienceSize: segment.audienceSize }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: ComposeResult = await res.json();
      setCompose(data);
      setSelectedChannel(data.suggestedChannel);
      setSelectedVariantIdx(0);
      setStep("compose");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 3 → 4: launch campaign ───────────────────────────────────────────
  async function handleLaunch() {
    if (!segment || !compose) return;
    setLoading(true);
    setError("");
    try {
      const variant = compose.variants[selectedVariantIdx];
      const res = await fetch("/api/ai/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief,
          segmentFilters: segment.filters,
          audienceSize: segment.audienceSize,
          channel: selectedChannel,
          message: variant.body,
          subject: variant.subject,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: LaunchResult = await res.json();
      setLaunchResult(data);
      setStep("launched");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep("brief");
    setBrief("");
    setSegment(null);
    setCompose(null);
    setLaunchResult(null);
    setError("");
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">AI Studio</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create a campaign</h1>
          <p className="text-gray-500 text-sm mt-1">
            Describe your goal. AI finds the right audience and writes the message.
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-6">
          <StepIndicator current={step} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── Step 1: Brief ─────────────────────────────────────────────── */}
          {step === "brief" && (
            <motion.div
              key="brief"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-violet-500" />
                <h2 className="font-semibold text-gray-900">Who do you want to reach?</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Describe your target audience in plain language. The more specific, the better.
              </p>

              <Textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="e.g. Customers who haven't ordered in 60 days but have spent over ₹5000 lifetime"
                className="min-h-[100px] text-sm resize-none border-gray-200 focus:border-violet-400 focus:ring-violet-400"
              />

              {/* Example prompts */}
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Examples</p>
                <div className="flex flex-col gap-1.5">
                  {EXAMPLE_BRIEFS.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setBrief(ex)}
                      className="text-left text-xs text-gray-500 hover:text-violet-600 px-3 py-2 rounded-lg hover:bg-violet-50 border border-transparent hover:border-violet-100 transition-all"
                    >
                      <Zap className="w-3 h-3 inline mr-1.5 text-violet-400" />
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button
  onClick={handleGenerateSegment}
  disabled={!brief.trim() || loading}
  className="gap-2"
  style={{ backgroundColor: "#7c3aed", color: "#ffffff" }}
>
  {loading ? (
    <><Loader2 className="w-4 h-4 animate-spin" />Analyzing audience…</>
  ) : (
    <>Find audience <ChevronRight className="w-4 h-4" /></>
  )}
</Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Segment preview ───────────────────────────────────── */}
          {step === "segment" && segment && (
            <motion.div
              key="segment"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Audience card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-violet-500" />
                      <h2 className="font-semibold text-gray-900">Audience found</h2>
                    </div>
                    <p className="text-sm text-gray-500">{segment.description}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-3xl font-bold text-gray-900">{segment.audienceSize.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">customers matched</div>
                  </div>
                </div>

                {/* Filters */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Applied filters</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(segment.filters).map(([k, v]) => (
                      <div key={k} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-700">
                        <span className="text-gray-400">{k.replace(/_/g, " ")}</span>
                        <span className="font-medium">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sample customers */}
              {segment.sampleCustomers.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Sample customers</p>
                  <div className="divide-y divide-gray-50">
                    {segment.sampleCustomers.slice(0, 5).map((c) => (
                      <div key={c.id} className="flex items-center justify-between py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-semibold text-violet-600">
                            {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{c.name}</div>
                            <div className="text-xs text-gray-400">{c.email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">₹{c.totalSpend.toLocaleString()}</div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              c.status === "active" && "bg-green-50 text-green-700",
                              c.status === "at_risk" && "bg-yellow-50 text-yellow-700",
                              c.status === "churned" && "bg-red-50 text-red-700"
                            )}
                          >
                            {c.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep("brief")} className="gap-1">
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button
  onClick={handleCompose}
  disabled={loading}
  className="gap-2"
  style={{ backgroundColor: "#7c3aed", color: "#ffffff" }}
>
  {loading ? (
    <><Loader2 className="w-4 h-4 animate-spin" />Writing messages…</>
  ) : (
    <>Write message <ChevronRight className="w-4 h-4" /></>
  )}
</Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Compose ───────────────────────────────────────────── */}
          {step === "compose" && compose && (
            <motion.div
              key="compose"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Channel picker */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Send className="w-4 h-4 text-violet-500" />
                  <h2 className="font-semibold text-gray-900">Choose channel</h2>
                  {compose.suggestedChannel && (
                    <Badge className="bg-violet-50 text-violet-700 border-violet-200 text-xs ml-1">
                      AI recommended
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  {(["email", "sms", "whatsapp"] as const).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setSelectedChannel(ch)}
                      className={cn(
                        "flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
                        selectedChannel === ch
                          ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"
                      )}
                    >
                      {CHANNEL_LABELS[ch]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message variants */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-violet-500" />
                    <h2 className="font-semibold text-gray-900">Message variants</h2>
                  </div>
                  <span className="text-xs text-gray-400">{compose.variants.length} versions generated</span>
                </div>

                <div className="space-y-3">
                  {compose.variants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVariantIdx(i)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border transition-all",
                        selectedVariantIdx === i
                          ? "border-violet-400 bg-violet-50 shadow-sm"
                          : "border-gray-100 hover:border-gray-300 bg-gray-50"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                            selectedVariantIdx === i
                              ? "border-violet-600 bg-violet-600"
                              : "border-gray-300"
                          )}
                        >
                          {selectedVariantIdx === i && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {v.tone}
                        </span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full border", CHANNEL_COLORS[v.channel])}>
                          {CHANNEL_LABELS[v.channel]}
                        </span>
                      </div>
                      {v.subject && (
                        <div className="text-sm font-semibold text-gray-900 mb-1">{v.subject}</div>
                      )}
                      <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{v.body}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep("segment")} className="gap-1">
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button
  onClick={handleLaunch}
  disabled={loading}
  className="gap-2"
  style={{ backgroundColor: "#7c3aed", color: "#ffffff" }}
>
  {loading ? (
    <><Loader2 className="w-4 h-4 animate-spin" />Launching…</>
  ) : (
    <><Rocket className="w-4 h-4" />Launch campaign</>
  )}
</Button>
<Button
  onClick={reset}
  className="gap-2"
  style={{ backgroundColor: "#7c3aed", color: "#ffffff" }}
>
  <RefreshCw className="w-4 h-4" /> New campaign
</Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Launched ──────────────────────────────────────────── */}
          {step === "launched" && launchResult && (
            <motion.div
              key="launched"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Campaign launched!</h2>
              <p className="text-gray-500 text-sm mb-6">
                Messages are being dispatched to your audience.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-gray-900">{launchResult.audienceSize.toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Recipients</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-gray-900 capitalize">{launchResult.channel}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Channel</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-600">Live</div>
                  <div className="text-xs text-gray-400 mt-0.5">Status</div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = `/campaigns/${launchResult.campaignId}`}
                  className="gap-2"
                >
                  View campaign
                </Button>
               <Button
  onClick={reset}
  className="gap-2"
  style={{ backgroundColor: "#7c3aed", color: "#ffffff" }}
>
  <RefreshCw className="w-4 h-4" /> New campaign
</Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}